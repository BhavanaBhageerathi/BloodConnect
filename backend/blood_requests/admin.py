from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import BloodRequest, RequestStatusHistory


@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'patient_name',
        'requester',
        'blood_bank',
        'blood_group',
        'units_required',
        'priority',
        'status',
        'created_at'
    )

    list_filter = ('status', 'priority', 'blood_group', 'district')

    search_fields = ('patient_name', 'requester__full_name')


@admin.register(RequestStatusHistory)
class RequestStatusHistoryAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'blood_request',
        'status',
        'updated_by',
        'timestamp'
    )

    list_filter = ('status', 'timestamp')