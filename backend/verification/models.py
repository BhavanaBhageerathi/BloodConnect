from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings


class DonorVerification(models.Model):

    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        MORE_INFO = 'MORE_INFO', 'More Information Required'

    donor = models.ForeignKey(
    'accounts.DonorProfile',
    on_delete=models.CASCADE,
    related_name='verification_applications'
)

    blood_bank = models.ForeignKey(
        'accounts.BloodBankProfile',
        on_delete=models.PROTECT,
        related_name='donor_verifications'
    )

    application_date = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )

    health_details = models.TextField()

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_verifications'
    )

    review_date = models.DateTimeField(null=True, blank=True)

    remarks = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['donor'], #checks for unique donor field
                condition=models.Q(status__in=['PENDING', 'MORE_INFO']), #if status is pending or moreinfo ,cannot apply another application.
                name='unique_active_donor_verification'#giving constraint name
            )
    ]

    def __str__(self):
        return f"{self.donor.full_name} - {self.status}"