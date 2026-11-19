from django.db import models
from django.db.models import Q, F


class DonationCamp(models.Model):

    class CampStatus(models.TextChoices):
        UPCOMING = 'UPCOMING', 'Upcoming'
        ONGOING = 'ONGOING', 'Ongoing'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    blood_bank = models.ForeignKey(
        'accounts.BloodBankProfile',
        on_delete=models.PROTECT,
        related_name='donation_camps'
    )

    camp_name = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    location = models.CharField(max_length=255)

    district = models.ForeignKey(
        'locations.District',
        on_delete=models.PROTECT,
        related_name='donation_camps'
    )

    camp_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=CampStatus.choices,
        default=CampStatus.UPCOMING
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(end_time__gt=F('start_time')),
                name='camp_end_time_after_start_time'
            )
        ]

    def __str__(self):
        return self.camp_name


class CampRegistration(models.Model):

    class RegistrationStatus(models.TextChoices):
        REGISTERED = 'REGISTERED', 'Registered'
        ATTENDED = 'ATTENDED', 'Attended'
        CANCELLED = 'CANCELLED', 'Cancelled'

    camp = models.ForeignKey(
        DonationCamp,
        on_delete=models.CASCADE,
        related_name='registrations'
    )

    donor = models.ForeignKey(
        'accounts.DonorProfile',
        on_delete=models.CASCADE,
        related_name='camp_registrations'
    )

    registration_date = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=RegistrationStatus.choices,
        default=RegistrationStatus.REGISTERED
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['camp', 'donor'],
                condition=Q(status__in=['REGISTERED', 'ATTENDED']),
                name='unique_active_donor_camp_registration'
            )
        ]

    def __str__(self):
        return f"{self.donor.full_name} - {self.camp.camp_name}"