from rest_framework import serializers

from accounts.models import (
    User,
    BloodBankProfile
)

from verification.models import DonorVerification
from blood_requests.models import BloodRequest
from inventory.models import BloodUnit
from donations.models import DonationRecord
from camps.models import DonationCamp, CampRegistration
from notifications.models import Notification


# 1. USER MANAGEMENT

class AdminUserSerializer(serializers.ModelSerializer):

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'role',
            'is_active',
            'date_joined'
        ]

    def get_full_name(self, obj):

        if obj.role == User.Role.DONOR:
            profile = getattr(obj, 'donor_profile', None)
            return profile.full_name if profile else obj.username

        elif obj.role == User.Role.REQUESTER:
            profile = getattr(obj, 'requester_profile', None)
            return profile.full_name if profile else obj.username

        elif obj.role == User.Role.BLOOD_BANK:
            profile = getattr(obj, 'blood_bank_profile', None)
            return profile.blood_bank_name if profile else obj.username

        return obj.get_full_name() or obj.username


class AdminUserStatusSerializer(serializers.Serializer):

    is_active = serializers.BooleanField()


# 2. BLOOD BANK MANAGEMENT

class AdminBloodBankSerializer(serializers.ModelSerializer):

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

    is_active = serializers.BooleanField(
        source='user.is_active',
        read_only=True
    )

    district = serializers.CharField(
        source='district.name',
        read_only=True
    )

    class Meta:
        model = BloodBankProfile

        fields = [
            'id',
            'username',
            'email',
            'phone',
            'is_active',
            'blood_bank_name',
            'registration_number',
            'contact_person',
            'district',
            'address',
            'verification_status'
        ]


class AdminBloodBankReviewSerializer(serializers.Serializer):

    verification_status = serializers.ChoiceField(
        choices=['APPROVED', 'REJECTED']
    )


# 3. DONOR VERIFICATION MONITORING

class AdminVerificationSerializer(serializers.ModelSerializer):

    donor_name = serializers.CharField(
        source='donor.full_name',
        read_only=True
    )

    donor_email = serializers.EmailField(
        source='donor.user.email',
        read_only=True
    )

    donor_blood_group = serializers.CharField(
        source='donor.blood_group',
        read_only=True
    )

    blood_bank_name = serializers.CharField(
        source='blood_bank.blood_bank_name',
        read_only=True
    )

    reviewed_by = serializers.CharField(
        source='reviewed_by.username',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = DonorVerification

        fields = [
            'id',
            'donor_name',
            'donor_email',
            'donor_blood_group',
            'blood_bank_name',
            'application_date',
            'status',
            'health_details',
            'reviewed_by',
            'review_date',
            'remarks'
        ]


# 4. BLOOD REQUEST MONITORING

class AdminBloodRequestSerializer(serializers.ModelSerializer):

    requester_name = serializers.CharField(
        source='requester.full_name',
        read_only=True
    )

    requester_email = serializers.EmailField(
        source='requester.user.email',
        read_only=True
    )

    blood_bank_name = serializers.CharField(
        source='blood_bank.blood_bank_name',
        read_only=True
    )

    district_name = serializers.CharField(
        source='district.name',
        read_only=True
    )

    class Meta:
        model = BloodRequest

        fields = [
            'id',
            'requester_name',
            'requester_email',
            'blood_bank_name',
            'patient_name',
            'patient_age',
            'blood_group',
            'units_required',
            'hospital_name',
            'hospital_address',
            'city',
            'district_name',
            'required_date',
            'priority',
            'requester_contact',
            'doctor_contact',
            'additional_info',
            'status',
            'rejection_reason',
            'created_at'
        ]


# 5. INVENTORY MONITORING

class AdminBloodUnitSerializer(serializers.ModelSerializer):

    blood_bank_name = serializers.CharField(
        source='blood_bank.blood_bank_name',
        read_only=True
    )

    district_name = serializers.CharField(
        source='blood_bank.district.name',
        read_only=True
    )

    class Meta:
        model = BloodUnit

        fields = [
            'id',
            'blood_bank',
            'blood_bank_name',
            'district_name',
            'donation_record',
            'blood_group',
            'collection_date',
            'expiry_date',
            'status'
        ]


# 6. DONATION MONITORING

class AdminDonationRecordSerializer(serializers.ModelSerializer):

    donor_name = serializers.CharField(
        source='donor.full_name',
        read_only=True
    )

    donor_email = serializers.EmailField(
        source='donor.user.email',
        read_only=True
    )

    blood_bank_name = serializers.CharField(
        source='blood_bank.blood_bank_name',
        read_only=True
    )

    class Meta:
        model = DonationRecord

        fields = [
            'id',
            'donor_name',
            'donor_email',
            'blood_bank_name',
            'blood_group',
            'units_donated',
            'donation_date',
            'status'
        ]


# 7. CAMP MONITORING

class AdminCampSerializer(serializers.ModelSerializer):

    blood_bank_name = serializers.CharField(
        source='blood_bank.blood_bank_name',
        read_only=True
    )

    district_name = serializers.CharField(
        source='district.name',
        read_only=True
    )

    registrations_count = serializers.SerializerMethodField()

    class Meta:
        model = DonationCamp

        fields = [
            'id',
            'blood_bank_name',
            'camp_name',
            'description',
            'location',
            'district_name',
            'camp_date',
            'start_time',
            'end_time',
            'status',
            'registrations_count'
        ]

    def get_registrations_count(self, obj):
        return obj.registrations.count()


class AdminCampRegistrationSerializer(serializers.ModelSerializer):

    camp_name = serializers.CharField(
        source='camp.camp_name',
        read_only=True
    )

    camp_date = serializers.DateField(
        source='camp.camp_date',
        read_only=True
    )

    blood_bank_name = serializers.CharField(
        source='camp.blood_bank.blood_bank_name',
        read_only=True
    )

    donor_name = serializers.CharField(
        source='donor.full_name',
        read_only=True
    )

    donor_blood_group = serializers.CharField(
        source='donor.blood_group',
        read_only=True
    )

    class Meta:
        model = CampRegistration

        fields = [
            'id',
            'camp_name',
            'camp_date',
            'blood_bank_name',
            'donor_name',
            'donor_blood_group',
            'registration_date',
            'status'
        ]


# 8. NOTIFICATIONS

class AdminNotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification

        fields = [
            'id',
            'title',
            'message',
            'notification_type',
            'is_read',
            'created_at',
            'related_request'
        ]