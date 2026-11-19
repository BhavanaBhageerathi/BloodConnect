from rest_framework import serializers
from .models import DonorInvitation
from .models import DonationRequest

from rest_framework import serializers
from accounts.models import DonorProfile


class DonorInvitationSerializer(serializers.ModelSerializer):

    donation_request_id = serializers.IntegerField(
        source='donation_request.id',
        read_only=True
    )

    blood_group = serializers.CharField(
        source='donation_request.blood_group',
        read_only=True
    )

    units_required = serializers.IntegerField(
        source='donation_request.units_required',
        read_only=True
    )

    priority = serializers.CharField(
        source='donation_request.priority',
        read_only=True
    )

    district = serializers.CharField(
        source='donation_request.district.name',
        read_only=True
    )

    blood_bank_name = serializers.CharField(
        source='donation_request.blood_bank.blood_bank_name',
        read_only=True
    )

    class Meta:
        model = DonorInvitation

        fields = [
            'id',
            'donation_request_id',
            'blood_bank_name',
            'blood_group',
            'units_required',
            'priority',
            'district',
            'status',
            'sent_at',
            'responded_at'
        ]

        read_only_fields = fields

class DonorInvitationResponseSerializer(serializers.Serializer): #using normal serializers as we are nit exposoing all the model fields

    status = serializers.ChoiceField(
        choices=[
            ('ACCEPTED', 'Accepted'),
            ('DECLINED', 'Declined')
        ]
    )


class BloodBankDonorInvitationSerializer(serializers.ModelSerializer):

    donor_name = serializers.CharField(
        source='donor.full_name',
        read_only=True
    )

    donor_blood_group = serializers.CharField(
        source='donor.blood_group',
        read_only=True
    )

    donor_district = serializers.CharField(
        source='donor.district.name',
        read_only=True
    )

    donation_request_blood_group = serializers.CharField(
        source='donation_request.blood_group',
        read_only=True
    )

    units_required = serializers.IntegerField(
        source='donation_request.units_required',
        read_only=True
    )

    priority = serializers.CharField(
        source='donation_request.priority',
        read_only=True
    )

    donation_request_district = serializers.CharField(
        source='donation_request.district.name',
        read_only=True
    )

    health_verified_at = serializers.DateTimeField(
        read_only=True
    )

    class Meta:
        model = DonorInvitation

        fields = [
            'id',
            'donation_request',
            'donor_name',
            'donor_blood_group',
            'donor_district',
            'donation_request_blood_group',
            'units_required',
            'priority',
            'donation_request_district',
            'status',
            'sent_at',
            'responded_at',
            'health_verified_at'
        ]

        read_only_fields = fields

class DonationCompletionSerializer(serializers.Serializer):
    invitation_id = serializers.IntegerField()
    donation_date = serializers.DateField()

    def validate_donation_date(self, value):
        from django.utils import timezone

        if value > timezone.localdate():
            raise serializers.ValidationError(
                "Donation date cannot be in the future."
            )

        return value
from .models import DonationRecord


class DonorDonationHistorySerializer(serializers.ModelSerializer):

    blood_bank_name = serializers.CharField(
        source='blood_bank.blood_bank_name',
        read_only=True
    )

    class Meta:
        model = DonationRecord
        fields = [
            'id',
            'blood_bank_name',
            'blood_group',
            'units_donated',
            'donation_date',
            'status'
        ]

        read_only_fields = fields


class BloodBankDonationHistorySerializer(serializers.ModelSerializer):

    donor_name = serializers.CharField(
        source='donor.full_name',
        read_only=True
    )

    class Meta:
        model = DonationRecord

        fields = [
            'id',
            'donor_name',
            'blood_group',
            'units_donated',
            'donation_date',
            'status'
        ]

        read_only_fields = fields




class EligibleDonorSerializer(serializers.ModelSerializer):

    district_name = serializers.CharField(
        source='district.name',
        read_only=True
    )

    phone = serializers.CharField(
        source='user.phone',
        read_only=True
    )

    next_eligible_date = serializers.ReadOnlyField()

    class Meta:
        model = DonorProfile

        fields = [
            'id',
            'full_name',
            'phone',
            'blood_group',
            'gender',
            'district',
            'district_name',
            'weight',
            'last_donation_date',
            'next_eligible_date',
            'address',
        ]


class DonorInvitationCreateSerializer(serializers.Serializer):

    donation_request_id = serializers.IntegerField()

    donor_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )

class DonationRequestListSerializer(serializers.ModelSerializer):

    district_name = serializers.CharField(
        source='district.name',
        read_only=True
    )

    class Meta:
        model = DonationRequest
        fields = [
            'id',
            'blood_group',
            'units_required',
            'priority',
            'district',
            'district_name',
            'status',
            'created_at'
        ]