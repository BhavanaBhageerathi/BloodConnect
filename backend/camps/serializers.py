from rest_framework import serializers
from django.utils import timezone

from .models import DonationCamp


class DonationCampSerializer(serializers.ModelSerializer):

    blood_bank_name = serializers.CharField(
        source='blood_bank.blood_bank_name',
        read_only=True
    )

    district_name = serializers.CharField(
        source='district.name',
        read_only=True
    )

    class Meta:
        model = DonationCamp

        fields = [
            'id',
            'blood_bank',
            'blood_bank_name',
            'camp_name',
            'description',
            'location',
            'district',
            'district_name',
            'camp_date',
            'start_time',
            'end_time',
            'status'
        ]

        read_only_fields = [
            'id',
            'blood_bank',
            'blood_bank_name',
            'district_name',
            'status'
        ]

    def validate_camp_date(self, value):

        if value < timezone.localdate():
            raise serializers.ValidationError(
                "Camp date cannot be in the past."
            )

        return value

    def validate(self, attrs):

        start_time = attrs.get(
            'start_time',
            getattr(self.instance, 'start_time', None)
        )

        end_time = attrs.get(
            'end_time',
            getattr(self.instance, 'end_time', None)
        )

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({
                'end_time': 'End time must be later than start time.'
            })

        return attrs

from .models import CampRegistration


class CampRegistrationSerializer(serializers.ModelSerializer):

    camp_name = serializers.CharField(
        source='camp.camp_name',
        read_only=True
    )

    camp_date = serializers.DateField(
        source='camp.camp_date',
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

    donor_district = serializers.CharField(
        source='donor.district.name',
        read_only=True
    )

    class Meta:
        model = CampRegistration

        fields = [
            'id',
            'camp',
            'camp_name',
            'camp_date',
            'registration_date',
            'status',
            'donor_name',
            'donor_blood_group',
            'donor_district',
        ]

        read_only_fields = [
            'id',
            'camp_name',
            'camp_date',
            'registration_date',
            'status'
        ]

    def validate_camp(self, value):

        if value.status != 'UPCOMING':
            raise serializers.ValidationError(
                "You can register only for upcoming camps."
            )

        if value.camp_date < timezone.localdate():
            raise serializers.ValidationError(
                "Registration is closed for this camp."
            )

        return value