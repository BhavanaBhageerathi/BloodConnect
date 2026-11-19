
from django.db import models


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        BLOOD_REQUEST = 'BLOOD_REQUEST', 'Blood Request'
        REQUEST_UPDATE = 'REQUEST_UPDATE', 'Request Update'
        DONATION_INVITATION = 'DONATION_INVITATION', 'Donation Invitation'
        DONATION_RESPONSE = 'DONATION_RESPONSE', 'Donation Response'
        DONATION_COMPLETED = 'DONATION_COMPLETED', 'Donation Completed'
        VERIFICATION_UPDATE = 'VERIFICATION_UPDATE', 'Verification Update'
        LOW_STOCK = 'LOW_STOCK', 'Low Stock Alert'
        CAMP_UPDATE = 'CAMP_UPDATE', 'Camp Update'
        GENERAL = 'GENERAL', 'General'

    recipient = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    title = models.CharField(max_length=200)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL
    )

    is_read = models.BooleanField(default=False)#wether user has read or not

    created_at = models.DateTimeField(auto_now_add=True)

    related_request = models.ForeignKey(
        'blood_requests.BloodRequest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )

    def __str__(self):
        return f"{self.title} - {self.recipient.username}"