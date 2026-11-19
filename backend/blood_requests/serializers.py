from rest_framework import serializers
from accounts.models import BloodBankProfile
from .models import BloodRequest, RequestStatusHistory


class BloodRequestSerializer(serializers.ModelSerializer):

    blood_bank = serializers.PrimaryKeyRelatedField(
        queryset=BloodBankProfile.objects.filter(
            verification_status='APPROVED',
            user__is_active=True
        )
    )

    units_required = serializers.IntegerField(min_value=1)

    patient_age = serializers.IntegerField(min_value=0,max_value=120)
    district_name = serializers.CharField(
        source='district.name',
        read_only=True
    )
    class Meta:
        model = BloodRequest

        fields = [
            'id',
            'blood_bank',
            'patient_name',
            'patient_age',
            'blood_group',
            'units_required',
            'hospital_name',
            'hospital_address',
            'city',
            'district',
            "district_name",
            'required_date',
            'priority',
            'requester_contact',
            'doctor_contact',
            'additional_info',
            'supporting_document',
            'status',
            'rejection_reason',

            'created_at',
        ]

        read_only_fields = [
            'id',
            'status',
            'created_at',
        ]

    def validate_blood_group(self, value):
        valid_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

        if value not in valid_groups:
            raise serializers.ValidationError("Please select a valid blood group.")

        return value


    def validate_required_date(self, value):
        from django.utils import timezone

        if value < timezone.localdate():
            raise serializers.ValidationError("Required date cannot be in the past.")

        return value

class BloodRequestReviewSerializer(serializers.Serializer):

    status = serializers.ChoiceField(
        choices=[
            ('ACCEPTED', 'Accepted'),
            ('REJECTED', 'Rejected')
        ]
    )
    rejection_reason = serializers.CharField(
        required=False,
        allow_blank=True
    )

    def validate(self, data):
        if data['status'] == 'REJECTED' and not data.get('rejection_reason', '').strip():
            raise serializers.ValidationError({
                'rejection_reason': 'Please provide a reason for rejecting the request.'
            })

        return data


class RequestStatusHistorySerializer(serializers.ModelSerializer):
    updated_by = serializers.SerializerMethodField()

    class Meta:
        model = RequestStatusHistory
        fields = ['status', 'updated_by', 'timestamp']

    def get_updated_by(self, obj):
        if obj.updated_by:
            return obj.updated_by.username
        return 'System' #if updated_by is None, it means the status was set by the system (e.g., when the request was created)