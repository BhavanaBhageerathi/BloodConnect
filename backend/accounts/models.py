from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date
from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import AbstractUser, UserManager

class CustomUserManager(UserManager):

    def create_superuser(self, username, email=None, password=None, **extra_fields):

        extra_fields['role'] = 'ADMIN'

        return super().create_superuser(
            username=username,
            email=email,
            password=password,
            **extra_fields
        )
    
class User(AbstractUser):

    class Role(models.TextChoices):
        DONOR = 'DONOR', 'Donor'
        REQUESTER = 'REQUESTER', 'Requester'
        BLOOD_BANK = 'BLOOD_BANK', 'Blood Bank'
        ADMIN = 'ADMIN', 'Admin'
    objects = CustomUserManager()
    phone = models.CharField(max_length=15, blank=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.REQUESTER
    )

    def __str__(self):
        return f"{self.username} - {self.role}"

class DonorProfile(models.Model):

    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'

    class BloodGroup(models.TextChoices):
        A_POSITIVE = 'A+', 'A+'
        A_NEGATIVE = 'A-', 'A-'
        B_POSITIVE = 'B+', 'B+'
        B_NEGATIVE = 'B-', 'B-'
        AB_POSITIVE = 'AB+', 'AB+'
        AB_NEGATIVE = 'AB-', 'AB-'
        O_POSITIVE = 'O+', 'O+'
        O_NEGATIVE = 'O-', 'O-'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='donor_profile'
    )

    full_name = models.CharField(max_length=150)

    date_of_birth = models.DateField()

    weight = models.DecimalField(
    max_digits=5,
    decimal_places=2,
    null=True,
    blank=True
)

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices
    )

    blood_group = models.CharField(
        max_length=3,
        choices=BloodGroup.choices
    )

    district = models.ForeignKey(
        'locations.District',
        on_delete=models.PROTECT,
        related_name='donors'
    )

    address = models.TextField()

    last_donation_date = models.DateField(null=True, blank=True)

    availability_status = models.BooleanField(default=True)

    def __str__(self):
        return self.full_name

    @property
    def is_age_eligible(self):
        today = date.today()

        age = today.year - self.date_of_birth.year

        if (today.month, today.day) < (
            self.date_of_birth.month,
            self.date_of_birth.day
        ):
            age -= 1

        if age < 18 or age > 65:
            return False

        # First-time donors must not be over 60
        if not self.last_donation_date and age > 60:
            return False

        return True

    @property
    def is_weight_eligible(self):
        return self.weight is not None and self.weight >= 45

    @property
    def next_eligible_date(self):
        if not self.last_donation_date:
            return None

        cooldown_months = 3 if self.gender == 'MALE' else 4

        return self.last_donation_date + relativedelta(
            months=cooldown_months
        ) #calculates the next eligible date for donation based on the last donation date and gender +3 or 4 months
          #and returns the date

    @property
    def is_eligible_to_donate(self):
        if not self.last_donation_date:
            return True  #first time donor is eligible to donate

        return date.today() >= self.next_eligible_date #prev funct that returns the date


    @property
    def is_available_for_donation(self):
        return (
            self.availability_status
            and self.is_eligible_to_donate
            and self.is_age_eligible
            and self.is_weight_eligible
        )  #returns both the availability status and the eligibility.
           #used for blood banks to get donors

    @property #can be used for availability status
    def is_available(self):
        return self.availability_status

    @property #can be used for f.e
    def is_in_cooldown_period(self):
        if not self.last_donation_date:
            return False

        return date.today() < self.next_eligible_date

class RequesterProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='requester_profile'
    )

    full_name = models.CharField(max_length=150)

    district = models.ForeignKey(
        'locations.District',
        on_delete=models.PROTECT,
        related_name='requesters'
    )

    address = models.TextField()

    def __str__(self):
        return self.full_name

class BloodBankProfile(models.Model):

    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='blood_bank_profile'
    )

    blood_bank_name = models.CharField(max_length=200)

    registration_number = models.CharField(
        max_length=100,
        unique=True
    )

    contact_person = models.CharField(max_length=150)

    district = models.ForeignKey(
        'locations.District',
        on_delete=models.PROTECT,
        related_name='blood_banks'
    )

    address = models.TextField()

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )

    def __str__(self):
        return self.blood_bank_name