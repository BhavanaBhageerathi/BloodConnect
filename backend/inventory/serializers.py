from rest_framework import serializers
from .models import BloodAllocation, BloodUnit, BloodStockThreshold


class BloodUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloodUnit
        fields = [
            'id',
            'blood_group',
            'collection_date',
            'expiry_date',
            'status'
        ]
        read_only_fields = fields

class BloodStockThresholdSerializer(serializers.ModelSerializer):
    minimum_units = serializers.IntegerField(min_value=1)
    class Meta:
        model = BloodStockThreshold
        fields = [
            'id',
            'blood_group',
            'minimum_units'
        ]
        read_only_fields = ['id']

class BloodAllocationSerializer(serializers.ModelSerializer):

    blood_request_id = serializers.IntegerField(
        source='blood_request.id',
        read_only=True
    )

    patient_name = serializers.CharField(
        source='blood_request.patient_name',
        read_only=True
    )

    hospital_name = serializers.CharField(
        source='blood_request.hospital_name',
        read_only=True
    )

    blood_group = serializers.CharField(
        source='blood_unit.blood_group',
        read_only=True
    )

    expiry_date = serializers.DateField(
        source='blood_unit.expiry_date',
        read_only=True
    )

    class Meta:
        model = BloodAllocation
        fields = [
            'id',
            'blood_request_id',
            'patient_name',
            'hospital_name',
            'blood_group',
            'expiry_date',
            'status',
            'reserved_at',
            'issued_at'
        ]

        read_only_fields = fields