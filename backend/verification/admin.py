from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import DonorVerification


@admin.register(DonorVerification)
class DonorVerificationAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'donor',
        'blood_bank',
        'status',
        'application_date',
        'review_date'
    )

    list_filter = ('status', 'application_date')

    search_fields = (
        'donor__full_name',
        'blood_bank__blood_bank_name'
    )