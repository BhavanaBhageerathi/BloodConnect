from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import DonationRequest, DonorInvitation, DonationRecord


@admin.register(DonationRequest)
class DonationRequestAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'blood_bank',
        'blood_request',
        'blood_group',
        'units_required',
        'priority',
        'status',
        'created_at'
    )

    list_filter = ('status', 'priority', 'blood_group')
    search_fields = ('blood_bank__blood_bank_name',)


@admin.register(DonorInvitation)
class DonorInvitationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'donation_request',
        'donor',
        'status',
        'sent_at',
        'responded_at'
    )

    list_filter = ('status', 'sent_at')
    search_fields = ('donor__full_name',)


@admin.register(DonationRecord)
class DonationRecordAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'donor',
        'blood_bank',
        'blood_group',
        'units_donated',
        'donation_date',
        'status'
    )

    list_filter = ('blood_group', 'status', 'donation_date')
    search_fields = ('donor__full_name', 'blood_bank__blood_bank_name')