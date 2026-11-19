

from django.db import models


class BloodUnit(models.Model):

    class BloodGroup(models.TextChoices):
        A_POSITIVE = 'A+', 'A+'
        A_NEGATIVE = 'A-', 'A-'
        B_POSITIVE = 'B+', 'B+'
        B_NEGATIVE = 'B-', 'B-'
        AB_POSITIVE = 'AB+', 'AB+'
        AB_NEGATIVE = 'AB-', 'AB-'
        O_POSITIVE = 'O+', 'O+'
        O_NEGATIVE = 'O-', 'O-'

    class UnitStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        RESERVED = 'RESERVED', 'Reserved'
        ISSUED = 'ISSUED', 'Issued'
        EXPIRED = 'EXPIRED', 'Expired'

    class UnitSource(models.TextChoices):
        DONATION = 'DONATION', 'Donation'
        MANUAL = 'MANUAL', 'Manual Entry'

    blood_bank = models.ForeignKey(
        'accounts.BloodBankProfile',
        on_delete=models.PROTECT,
        related_name='blood_units'
    )

    donation_record = models.ForeignKey(
        'donations.DonationRecord',
        on_delete=models.PROTECT,
        related_name='blood_units',
        null=True,
        blank=True
    )

    source = models.CharField(
        max_length=20,
        choices=UnitSource.choices,
        default=UnitSource.DONATION
    )

    manual_added_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='manually_added_blood_units'
    )

    blood_group = models.CharField(
        max_length=3,
        choices=BloodGroup.choices
    )

    collection_date = models.DateField()

    expiry_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=UnitStatus.choices,
        default=UnitStatus.AVAILABLE
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(
                        source='DONATION',
                        donation_record__isnull=False
                    ) |
                    models.Q(
                        source='MANUAL',
                        donation_record__isnull=True
                    )
                ),
                name='blood_unit_source_record_constraint'
            )
        ]

    def __str__(self):
        return f"{self.blood_group} - Unit {self.id}"



class BloodAllocation(models.Model):

    class AllocationStatus(models.TextChoices):
        RESERVED = 'RESERVED', 'Reserved'
        ISSUED = 'ISSUED', 'Issued'
        CANCELLED = 'CANCELLED', 'Cancelled'

    blood_request = models.ForeignKey(
        'blood_requests.BloodRequest',
        on_delete=models.PROTECT,
        related_name='allocations'
    )

    blood_unit = models.ForeignKey(
        BloodUnit,
        on_delete=models.PROTECT,
        related_name='allocations'
    )

    status = models.CharField(
        max_length=20,
        choices=AllocationStatus.choices,
        default=AllocationStatus.RESERVED
    )

    reserved_at = models.DateTimeField(auto_now_add=True)

    issued_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        constraints = [ #setting constraint that a A unit can have only one active allocation.
            models.UniqueConstraint(
                fields=['blood_unit'],
                condition=models.Q(
                    status__in=['RESERVED', 'ISSUED']
                ),
                name='unique_active_blood_unit_allocation'
            )
        ]

    def __str__(self):
        return f"Request {self.blood_request.id} - Unit {self.blood_unit.id}"



class BloodStockThreshold(models.Model):

    class BloodGroup(models.TextChoices):
        A_POSITIVE = 'A+', 'A+'
        A_NEGATIVE = 'A-', 'A-'
        B_POSITIVE = 'B+', 'B+'
        B_NEGATIVE = 'B-', 'B-'
        AB_POSITIVE = 'AB+', 'AB+'
        AB_NEGATIVE = 'AB-', 'AB-'
        O_POSITIVE = 'O+', 'O+'
        O_NEGATIVE = 'O-', 'O-'

    blood_bank = models.ForeignKey(
        'accounts.BloodBankProfile',
        on_delete=models.CASCADE,
        related_name='stock_thresholds'
    )

    blood_group = models.CharField(
        max_length=3,
        choices=BloodGroup.choices
    )

    minimum_units = models.PositiveIntegerField(default=5)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['blood_bank', 'blood_group'],
                name='unique_blood_bank_blood_group_threshold' #tp prevent duplicate configurations for same bloodbank and bloodgroup
            )
        ]

    def __str__(self):
        return f"{self.blood_bank.blood_bank_name} - {self.blood_group}"