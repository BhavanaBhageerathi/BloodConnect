from rest_framework import serializers

from .models import DonorVerification
from accounts.models import BloodBankProfile
from accounts.serializers import DonorProfileSerializer

class DonorVerificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = DonorVerification

        fields = [
            'id',
            'donor',
            'blood_bank',
            'application_date',
            'status',
            'health_details',
            'reviewed_by',
            'review_date',
            'remarks'
        ]

        read_only_fields = [
            'id',
            'donor',
            'application_date',
            'status',
            'reviewed_by',
            'review_date',
            'remarks'
        ]
       

    def validate(self, data):

        donor = self.context['request'].user.donor_profile

        active_application = DonorVerification.objects.filter(
            donor=donor,
            status__in=[
                DonorVerification.VerificationStatus.PENDING,
                DonorVerification.VerificationStatus.MORE_INFO
            ]
        ).exists()

        if active_application:
            raise serializers.ValidationError(
                "You already have an active verification application. "
                "You cannot submit another application until it is completed."
            )

        return data

    blood_bank = serializers.PrimaryKeyRelatedField(
    queryset=BloodBankProfile.objects.filter(
        verification_status='APPROVED'
    )
)


class DonorVerificationReviewSerializer(serializers.ModelSerializer):

    donor_details = DonorProfileSerializer(
        source='donor',
        read_only=True
    )

    class Meta:
        model = DonorVerification

        fields = [
            'id',
            'donor',
            'donor_details',
            'blood_bank',
            'application_date',
            'status',
            'health_details',
            'reviewed_by',
            'review_date',
            'remarks'
        ]

        read_only_fields = [
            'id',
            'donor',
            'donor_details',
            'blood_bank',
            'application_date',
            'health_details',
            'reviewed_by',
            'review_date'
        ]

    def validate_status(self, value):
        allowed_statuses = [
            DonorVerification.VerificationStatus.APPROVED,
            DonorVerification.VerificationStatus.REJECTED,
            DonorVerification.VerificationStatus.MORE_INFO
        ]

        if value not in allowed_statuses:
            raise serializers.ValidationError(
                "Invalid verification review status."
            )

        return value