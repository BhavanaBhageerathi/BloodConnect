from datetime import date, timedelta

from django.db import transaction

from .models import BloodUnit, BloodAllocation, BloodStockThreshold
from notifications.models import Notification


@transaction.atomic
def reserve_blood_units(blood_request): #bloodreq obj passed so can access the bldgrp,bldbank and units required fm obj.

    # Find how many units are already reserved or issued
    already_allocated = BloodAllocation.objects.filter(
        blood_request=blood_request, #retrieves allocation records matching to this current blood req
        status__in=['RESERVED', 'ISSUED']
    ).count()

    remaining_units = blood_request.units_required - already_allocated

    if remaining_units <= 0:
        return 0 #nothing remaining, then nothing to reserve

    # Find eligible blood units using FEFO
    available_units = BloodUnit.objects.select_for_update().filter(  #select_for_update() locks the selected rows so if two employers of the same bloodbank cant reserve the same unit for diff req.
        blood_bank=blood_request.blood_bank,
        blood_group=blood_request.blood_group,
        status='AVAILABLE',
        expiry_date__gte=date.today()
    ).order_by('expiry_date', 'collection_date')[:remaining_units] #FEFO: first expiring first out, if same expiry then first collected first out. Slicing [:remaining_units] limits the queryset to the number of units needed.

    reserved_count = 0

    for unit in available_units: #LOOP THROUGH  AND CREATE ALLOCATION RECORD

        BloodAllocation.objects.create(
            blood_request=blood_request,
            blood_unit=unit,
            status='RESERVED'
        )
        #UPDATE original bloodbank ionventory to mark the unit as reserved
        unit.status = 'RESERVED'
        unit.save(update_fields=['status'])
        reserved_count += 1
        
    check_low_stock(blood_request.blood_bank)
    return reserved_count
#at end this funct return num of units reserved.


def calculate_expiry_date(collection_date):
    return collection_date + timedelta(days=21)


def check_low_stock(blood_bank):

    thresholds = BloodStockThreshold.objects.filter(
        blood_bank=blood_bank
    )

    for threshold in thresholds:

        available_count = BloodUnit.objects.filter(
            blood_bank=blood_bank,
            blood_group=threshold.blood_group,
            status='AVAILABLE',
            expiry_date__gte=date.today()
        ).count()
        if available_count < threshold.minimum_units:

            message = (
                f'Your {threshold.blood_group} blood stock is low. '
                f'Available units: {available_count}. '
                f'Minimum required: {threshold.minimum_units}.'
            )
            #Prevent duplicate alerts
            existing_alert = Notification.objects.filter(
                recipient=blood_bank.user,
                title='Low Blood Stock Alert',
                message=message,
                is_read=False
            ).exists()

            if not existing_alert:
                Notification.objects.create(
                    recipient=blood_bank.user,
                    title='Low Blood Stock Alert',
                    message=message,
                    notification_type='LOW_STOCK'
                )
            
            