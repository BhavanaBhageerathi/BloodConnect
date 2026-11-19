from django.db import models




class BloodRequest(models.Model):

    class Priority(models.TextChoices):
        NORMAL = 'NORMAL', 'Normal'
        URGENT = 'URGENT', 'Urgent'
        EMERGENCY = 'EMERGENCY', 'Emergency'

    class RequestStatus(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'Submitted'
        VERIFIED = 'VERIFIED', 'Verified'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        DONORS_NOTIFIED = 'DONORS_NOTIFIED', 'Donors Notified'
        DONATION_COORDINATED = 'DONATION_COORDINATED', 'Donation Coordinated'
        PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED', 'Partially Fulfilled'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    requester = models.ForeignKey(
        'accounts.RequesterProfile',
        on_delete=models.CASCADE,
        related_name='blood_requests'
    )

    blood_bank = models.ForeignKey(
        'accounts.BloodBankProfile',
        on_delete=models.PROTECT,
        related_name='received_requests'
    )

    patient_name = models.CharField(max_length=150)
    patient_age = models.PositiveIntegerField()

    blood_group = models.CharField(max_length=3)

    units_required = models.PositiveIntegerField()

    hospital_name = models.CharField(max_length=200)
    hospital_address = models.TextField()

    city = models.CharField(max_length=100)

    district = models.ForeignKey(
        'locations.District',
        on_delete=models.PROTECT,
        related_name='blood_requests'
    )

    required_date = models.DateField()

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.NORMAL
    )

    requester_contact = models.CharField(max_length=15)

    doctor_contact = models.CharField(max_length=15, blank=True)

    additional_info = models.TextField(blank=True)

    supporting_document = models.FileField(
        upload_to='blood_request_documents/',
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=30,
        choices=RequestStatus.choices,
        default=RequestStatus.SUBMITTED
    )

    rejection_reason = models.TextField(blank=True)


    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request {self.id} - {self.patient_name}"


class RequestStatusHistory(models.Model):

    blood_request = models.ForeignKey(
        BloodRequest,
        on_delete=models.CASCADE,
        related_name='status_history'
    )

    status = models.CharField(
        max_length=30,
        choices=BloodRequest.RequestStatus.choices
    )

    updated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='request_status_updates'
    )

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request {self.blood_request.id} - {self.status}"