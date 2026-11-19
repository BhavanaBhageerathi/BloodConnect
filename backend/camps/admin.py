from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import DonationCamp, CampRegistration


@admin.register(DonationCamp)
class DonationCampAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'camp_name',
        'blood_bank',
        'district',
        'camp_date',
        'start_time',
        'end_time',
        'status'
    )

    list_filter = ('status', 'district', 'camp_date')

    search_fields = ('camp_name', 'blood_bank__blood_bank_name')


@admin.register(CampRegistration)
class CampRegistrationAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'camp',
        'donor',
        'registration_date',
        'status'
    )

    list_filter = ('status', 'registration_date')

    search_fields = ('donor__full_name', 'camp__camp_name')