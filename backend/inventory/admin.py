from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import BloodUnit, BloodAllocation, BloodStockThreshold


@admin.register(BloodUnit)
class BloodUnitAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'blood_bank',
        'blood_group',
        'collection_date',
        'expiry_date',
        'status'
    )

    list_filter = ('blood_group', 'status', 'expiry_date')

    search_fields = ('blood_bank__blood_bank_name',)


@admin.register(BloodAllocation)
class BloodAllocationAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'blood_request',
        'blood_unit',
        'status',
        'reserved_at',
        'issued_at'
    )

    list_filter = ('status', 'reserved_at')


@admin.register(BloodStockThreshold)
class BloodStockThresholdAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'blood_bank',
        'blood_group',
        'minimum_units'
    )

    list_filter = ('blood_group',)

    search_fields = ('blood_bank__blood_bank_name',)