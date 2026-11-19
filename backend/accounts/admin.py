from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + ( #Django's original UserAdmin knows how to display the standard user fieldsBut it doesn't automatically know how we want to organize our additional fields
        ('Additional Information', {
            'fields': ('phone', 'role')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Information', {
            'fields': ('phone', 'role')
        }),
    )


from .models import DonorProfile


@admin.register(DonorProfile)
class DonorProfileAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'full_name',
        'blood_group',
        'gender',
        'district',
        'availability_status'
    )

    list_filter = ('blood_group', 'gender', 'district')

    search_fields = ('full_name', 'user__username')


from .models import RequesterProfile, BloodBankProfile


@admin.register(RequesterProfile)
class RequesterProfileAdmin(admin.ModelAdmin):

    list_display = ('id', 'full_name', 'user', 'district')

    list_filter = ('district',)

    search_fields = ('full_name', 'user__username')


@admin.register(BloodBankProfile)
class BloodBankProfileAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'blood_bank_name',
        'registration_number',
        'contact_person',
        'district',
        'verification_status'
    )

    list_filter = ('district', 'verification_status')

    search_fields = ('blood_bank_name', 'registration_number')