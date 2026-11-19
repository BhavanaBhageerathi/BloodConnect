from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import District


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):

    list_display = ('id', 'name', 'state')
    search_fields = ('name', 'state')