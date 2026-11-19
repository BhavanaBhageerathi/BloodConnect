from django.db import models

# Create your models here.
from django.db import models
from django.db.models import Q
# We import Q from django.db.models because we need to create a database constraint that checks multiple conditions using OR (|) and AND (,).


class DonationRequest(models.Model):

    class Priority(models.TextChoices):
        NORMAL = 'NORMAL', 'Normal'
        URGENT = 'URGENT', 'Urgent'
        EMERGENCY = 'EMERGENCY', 'Emergency'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        FULFILLED = 'FULFILLED', 'Fulfilled'
        CANCELLED = 'CANCELLED', 'Cancelled'

    blood_bank = models.ForeignKey(
        'accounts.BloodBankProfile',
        on_delete=models.PROTECT,
        related_name='donation_requests'
    )

    blood_request = models.ForeignKey(
        'blood_requests.BloodRequest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='donation_requests'
    )

    blood_group = models.CharField(max_length=3)

    units_required = models.PositiveIntegerField()

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.NORMAL
    )

    district = models.ForeignKey(
        'locations.District',
        on_delete=models.PROTECT,
        related_name='donation_requests'
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.blood_group} - {self.units_required} units"


class DonorInvitation(models.Model):

    class InvitationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        DECLINED = 'DECLINED', 'Declined'
        SELECTED = 'SELECTED', 'Selected'
        HEALTH_VERIFIED = 'HEALTH_VERIFIED', 'Health Verified'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    donation_request = models.ForeignKey(
        DonationRequest,
        on_delete=models.CASCADE,
        related_name='invitations'
    )

    donor = models.ForeignKey(
        'accounts.DonorProfile',
        on_delete=models.CASCADE,
        related_name='invitations'
    )

    status = models.CharField(
        max_length=20,
        choices=InvitationStatus.choices,
        default=InvitationStatus.PENDING
    )

    sent_at = models.DateTimeField(auto_now_add=True)

    responded_at = models.DateTimeField(
        null=True,
        blank=True
    )

    # Health verification details
    health_verified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    health_verified_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='health_verified_donations'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['donation_request', 'donor'],
                name='unique_donor_invitation'
            )
        ]

    def __str__(self):
        return f"{self.donor.full_name} - {self.status}"

class DonationRecord(models.Model):

    class DonationStatus(models.TextChoices):
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    donor = models.ForeignKey(
        'accounts.DonorProfile',
        on_delete=models.PROTECT,
        related_name='donations'
    )

    blood_bank = models.ForeignKey(
        'accounts.BloodBankProfile',
        on_delete=models.PROTECT,
        related_name='donation_records'
    )

    # Used when the donation happens through a regular donor invitation
    donor_invitation = models.OneToOneField(
        'donations.DonorInvitation',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='donation_record'
    )

    # Used when the donation happens through a donation camp
    camp_registration = models.OneToOneField(
        'camps.CampRegistration',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='donation_record'
    )

    blood_group = models.CharField(max_length=3)

    units_donated = models.PositiveIntegerField()

    donation_date = models.DateField()

    status = models.CharField(
        max_length=10,
        choices=DonationStatus.choices,
        default=DonationStatus.COMPLETED
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(
                        donor_invitation__isnull=False,
                        camp_registration__isnull=True
                    )
                    |
                    Q(
                        donor_invitation__isnull=True,
                        camp_registration__isnull=False
                    )
                ),
                name='exactly_one_donation_source'
            )
        ]

    def __str__(self):
        return f"{self.donor.full_name} - {self.donation_date}"