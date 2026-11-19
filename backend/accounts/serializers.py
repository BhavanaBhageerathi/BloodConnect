from rest_framework import serializers
from django.db import transaction
from datetime import date
from decimal import Decimal

from .models import (
    User,
    DonorProfile,
    RequesterProfile,
    BloodBankProfile
)


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    # Donor fields
    date_of_birth = serializers.DateField(required=False)
    gender = serializers.ChoiceField(
        choices=DonorProfile.Gender.choices,
        required=False
    )
    blood_group = serializers.ChoiceField(
        choices=DonorProfile.BloodGroup.choices,
        required=False
    )
    weight = serializers.DecimalField(
    max_digits=5,
    decimal_places=2,
    required=False
    )

    # Common profile fields
    full_name = serializers.CharField(required=False)
    district = serializers.IntegerField(required=False)
    address = serializers.CharField(required=False)

    # Blood bank fields
    blood_bank_name = serializers.CharField(required=False)
    registration_number = serializers.CharField(required=False)
    contact_person = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone',
            'role',
            'full_name',
            'date_of_birth',
            'gender',
            'blood_group',
            'weight',
            'district',
            'address',
            'blood_bank_name',
            'registration_number',
            'contact_person'
        ]
    



    def validate_role(self, value):
        if value == User.Role.ADMIN:
            raise serializers.ValidationError(
                "Admin accounts cannot be created through registration."
            )
        return value
    def validate_registration_number(self, value):
    
            if BloodBankProfile.objects.filter(
                registration_number=value
            ).exists():
    
                raise serializers.ValidationError(
                    "A blood bank with this registration number already exists."
                )
    
            return value

    def validate(self, data):

        role = data.get('role')
        # Automatically generate full name from first name and last name
        if role in [User.Role.DONOR, User.Role.REQUESTER]:
            data['full_name'] = (
                f"{data.get('first_name', '')} "
                f"{data.get('last_name', '')}"
            ).strip()

        # Fields allowed for each role
        role_fields = {
            User.Role.DONOR: {
                'full_name',
                'date_of_birth',
                'weight',
                'gender',
                'blood_group',
                'district',
                'address'
            },

            User.Role.REQUESTER: {
                'full_name',
                'district',
                'address'
            },

            User.Role.BLOOD_BANK: {
                'blood_bank_name',
                'registration_number',
                'contact_person',
                'district',
                'address'
            }
        }

        # Check whether the role is valid
        if role not in role_fields:
            raise serializers.ValidationError({
                'role': 'Invalid registration role.'
            })

        # Identify fields that do not belong to the selected role
        submitted_profile_fields = {
            'full_name',
            'date_of_birth',
            'gender',
            'blood_group',
            'weight',
            'district',
            'address',
            'blood_bank_name',
            'registration_number',
            'contact_person'
        }

        unexpected_fields = (
            submitted_profile_fields.intersection(data.keys())
            - role_fields[role]
        )

        if unexpected_fields:
            raise serializers.ValidationError({
                field: f"This field is not allowed for {role} registration."
                for field in unexpected_fields
            })

        # Validate required fields
        for field in role_fields[role]:

            if field not in data or data[field] in [None, '']:
                raise serializers.ValidationError({
                    field: f"{field} is required for {role} registration."
                })
        # Donor age and weight validation
        if role == User.Role.DONOR:

            dob = data['date_of_birth']
            weight = data['weight']

            # Calculate actual age
            today = date.today()
            age = today.year - dob.year

            if (today.month, today.day) < (dob.month, dob.day):
                age -= 1

            # Validate age
            if age < 18 or age > 60:
                raise serializers.ValidationError({
                    'date_of_birth': 'Donors must be between 18 and 60 years old during registration.'
                })

            # Validate weight
            if weight < Decimal('45.00'):
                raise serializers.ValidationError({
                    'weight': 'Minimum weight required for blood donation is 45 kg.'
                })
        return data
    
    @transaction.atomic
    def create(self, validated_data):

        role = validated_data['role']

        # Extract profile-specific information
        profile_fields = [
            'full_name',
            'date_of_birth',
            'weight',
            'gender',
            'blood_group',
            'district',
            'address',
            'blood_bank_name',
            'registration_number',
            'contact_person'
        ]

        profile_data = {}

        for field in profile_fields:
            if field in validated_data:
                profile_data[field] = validated_data.pop(field)

        password = validated_data.pop('password')

        # Create user securely
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        district_id = profile_data.pop('district')
        # Create the corresponding profile
        if role == User.Role.DONOR:
            DonorProfile.objects.create(
                user=user,
                district_id=district_id,
                **profile_data
            )

        elif role == User.Role.REQUESTER:
            RequesterProfile.objects.create(
                user=user,
                district_id=district_id,
                **profile_data
            )

        elif role == User.Role.BLOOD_BANK:
            BloodBankProfile.objects.create(
                user=user,
                blood_bank_name=profile_data['blood_bank_name'],
                registration_number=profile_data['registration_number'],
                contact_person=profile_data['contact_person'],
                district_id=district_id,
                address=profile_data['address']
            )

        return user


from django.contrib.auth import authenticate


class LoginSerializer(serializers.Serializer):

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):

        username = data.get('username')
        password = data.get('password')

        user = authenticate(
            username=username,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        data['user'] = user

        return data


class DonorProfileSerializer(serializers.ModelSerializer):

    next_eligible_date = serializers.ReadOnlyField()
    is_eligible_to_donate = serializers.ReadOnlyField()
    is_available_for_donation = serializers.ReadOnlyField()
    is_age_eligible = serializers.ReadOnlyField()
    is_weight_eligible = serializers.ReadOnlyField()
    is_in_cooldown_period = serializers.ReadOnlyField()

    class Meta:
        model = DonorProfile

        fields = [
            'id',
            'full_name',
            'date_of_birth',
            'gender',
            'blood_group',
            'district',
            'address',
            'weight',
            'is_age_eligible',
            'is_weight_eligible',
            'last_donation_date',
            'availability_status', #editable
            'next_eligible_date',
            'is_eligible_to_donate',
            'is_available_for_donation',
            'is_in_cooldown_period',
        ]

        read_only_fields = [
            'id',
            'last_donation_date',
            'next_eligible_date',
            'is_eligible_to_donate',
            'is_available_for_donation',
            'is_age_eligible',
            'is_weight_eligible',
            'is_in_cooldown_period'
        ]

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Weight must be greater than 0 kg."
            )
        return value

class RequesterProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = RequesterProfile
        fields = [
            'id',
            'full_name',
            'district',
            'address',
        ]
        read_only_fields = ['id']

class BloodBankProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = BloodBankProfile
        fields = [
            'id',
            'blood_bank_name',
            'registration_number',
            'contact_person',
            'district',
            'address',
            'verification_status',
        ]
        read_only_fields = [
            'id',
            'registration_number',
            'verification_status',
        ]


class ApprovedBloodBankSerializer(serializers.ModelSerializer):

    district = serializers.CharField(
        source='district.name',
        read_only=True
    )

    class Meta:
        model = BloodBankProfile
        fields = [
            'id',
            'blood_bank_name',
            'district'
        ]

class AdminBloodBankSerializer(serializers.ModelSerializer):

    district = serializers.CharField(
        source='district.name',
        read_only=True
    )

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    email = serializers.EmailField(
        source='user.email',
        read_only=True
    )

    phone = serializers.CharField(
        source='user.phone',
        read_only=True
    )

    class Meta:
        model = BloodBankProfile
        fields = [
            'id',
            'username',
            'email',
            'phone',
            'blood_bank_name',
            'registration_number',
            'contact_person',
            'district',
            'address',
            'verification_status'
        ]