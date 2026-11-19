from datetime import datetime

from django.db import transaction
from django.utils import timezone

from .models import DonationCamp


def update_camp_statuses():

    current_time = timezone.localtime(timezone.now())
    current_timezone = timezone.get_current_timezone()

    updated_count = 0

    with transaction.atomic():

        camps = DonationCamp.objects.select_for_update().filter(
            status__in=[
                DonationCamp.CampStatus.UPCOMING,
                DonationCamp.CampStatus.ONGOING
            ]
        )

        for camp in camps:

            camp_start = timezone.make_aware(
                datetime.combine(camp.camp_date, camp.start_time),
                current_timezone
            )

            camp_end = timezone.make_aware(
                datetime.combine(camp.camp_date, camp.end_time),
                current_timezone
            )

            new_status = camp.status

            if current_time >= camp_end:
                new_status = DonationCamp.CampStatus.COMPLETED

            elif current_time >= camp_start:
                new_status = DonationCamp.CampStatus.ONGOING

            if new_status != camp.status:

                camp.status = new_status

                camp.save(update_fields=['status'])

                updated_count += 1

    return updated_count

# It retrieves camps whose status is UPCOMING or ONGOING.
# It compares the current time with each camp's start and end times.
# It updates the status when necessary.
# It uses transaction.atomic() and select_for_update() to protect concurrent updates.
# It returns the number of camps whose statuses were changed.