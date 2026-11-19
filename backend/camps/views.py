from django.db import transaction
from django.utils import timezone
from notifications.models import Notification

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from accounts.models import DonorProfile
from verification.models import DonorVerification

from permissions import IsDonor, IsBloodBank

from .models import DonationCamp, CampRegistration
from .serializers import (
    DonationCampSerializer,
    CampRegistrationSerializer
)
from .services import update_camp_statuses


# --------------------------------------------------
# HELPER FUNCTION
# --------------------------------------------------

def is_approved_blood_bank(user):
    """
    Check whether the logged-in blood bank
    has been approved by the administrator.
    """

    return (
        hasattr(user, 'blood_bank_profile')
        and user.blood_bank_profile.verification_status == 'APPROVED'
    )


# --------------------------------------------------
# 1. LIST AND CREATE CAMPS
# GET  /api/camps/
# POST /api/camps/
# --------------------------------------------------

class CampListCreateView(generics.ListCreateAPIView):

    serializer_class = DonationCampSerializer

    def get_permissions(self):

        if self.request.method == 'GET':
            return [AllowAny()]

        return [IsBloodBank()]

    def get_queryset(self):
        # Automatically update camp statuses before retrieving camps.
        update_camp_statuses()
        queryset = DonationCamp.objects.select_related(
            'blood_bank',
            'district'
        )

        # Blood banks can view their own camps.
        if (
            self.request.user.is_authenticated
            and self.request.user.role == 'BLOOD_BANK'
        ):

            queryset = queryset.filter(
                blood_bank__user=self.request.user
            )

        else:

            # Public users can browse upcoming
            # and ongoing camps.
            queryset = queryset.filter(
                status__in=[
                    DonationCamp.CampStatus.UPCOMING,
                    DonationCamp.CampStatus.ONGOING
                ]
            )

        # District filter
        district_id = self.request.query_params.get('district')

        if district_id:
            queryset = queryset.filter(
                district_id=district_id
            )

        # Exact date filter
        camp_date = self.request.query_params.get('date')

        if camp_date:
            queryset = queryset.filter(
                camp_date=camp_date
            )

        # Date range filters
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if start_date:
            queryset = queryset.filter(
                camp_date__gte=start_date
            )

        if end_date:
            queryset = queryset.filter(
                camp_date__lte=end_date
            )

        return queryset.order_by(
            'camp_date',
            'start_time'
        )

    def perform_create(self, serializer):

        if not is_approved_blood_bank(self.request.user):
            raise PermissionDenied(
                'Only approved blood banks can create camps.'
            )

        # Automatically associate the camp
        # with the logged-in blood bank.
        blood_bank = self.request.user.blood_bank_profile

        serializer.save(
            blood_bank=blood_bank
        )


# --------------------------------------------------
# 2. UPDATE OWN CAMP
# PUT/PATCH /api/camps/<id>/
# --------------------------------------------------

class CampUpdateView(generics.UpdateAPIView):

    serializer_class = DonationCampSerializer
    permission_classes = [IsBloodBank]

    http_method_names = [
        'put',
        'patch'
    ]

    def get_queryset(self):

        if not is_approved_blood_bank(self.request.user):
            return DonationCamp.objects.none()

        return DonationCamp.objects.filter(
            blood_bank__user=self.request.user
        )

    @transaction.atomic
    def perform_update(self, serializer):

        # Lock the camp before updating it.
        camp = DonationCamp.objects.select_for_update().get(
            pk=serializer.instance.pk,
            blood_bank__user=self.request.user
        )

        serializer.instance = camp

        # Store the original important details.
        old_details = {
            'camp_date': camp.camp_date,
            'start_time': camp.start_time,
            'end_time': camp.end_time,
            'location': camp.location
        }

        # Save using the locked instance.
        camp = serializer.save()

        # Check whether any important detail changed.
        changed_fields = []

        for field, old_value in old_details.items():

            if getattr(camp, field) != old_value:
                changed_fields.append(field)

        # Notify registered donors only if important details changed.
        if changed_fields:

            registrations = CampRegistration.objects.filter(
                camp=camp,
                status=CampRegistration.RegistrationStatus.REGISTERED
            ).select_related('donor__user')

            for registration in registrations:

                Notification.objects.create(
                    recipient=registration.donor.user,
                    title='Donation Camp Updated',
                    message=(
                        f'The donation camp "{camp.camp_name}" has been updated. '
                        f'Please check the latest camp details. '
                        f'Updated information: {", ".join(changed_fields)}.'
                    ),
                    notification_type=Notification.NotificationType.CAMP_UPDATE
                )

# --------------------------------------------------
# 3. DONOR REGISTERS FOR A CAMP
# POST /api/camps/<id>/register/
# --------------------------------------------------

class CampRegistrationCreateView(APIView):

    permission_classes = [IsDonor]

    @transaction.atomic
    def post(self, request, pk):

        donor = request.user.donor_profile

        # Lock the camp row to prevent concurrent
        # duplicate registrations for the same camp.
        try:

            camp = DonationCamp.objects.select_for_update().get(
                pk=pk
            )

        except DonationCamp.DoesNotExist:

            return Response(
                {'error': 'Camp not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check camp status.
        if camp.status != DonationCamp.CampStatus.UPCOMING:

            return Response(
                {'error': 'This camp is not open for registration.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        now = timezone.localtime()

        # Check whether camp date has passed.
        if camp.camp_date < now.date():

            return Response(
                {'error': 'Registration is closed for this camp.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Registration is not allowed after the camp starts.
        if (
            camp.camp_date == now.date()
            and camp.start_time <= now.time()
        ):

            return Response(
                {'error': 'Registration is closed because the camp has started.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Only verified donors can register.
        is_verified = DonorVerification.objects.filter(
            donor=donor,
            status='APPROVED'
        ).exists()

        if not is_verified:

            return Response(
                {'error': 'Only verified donors can register for camps.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Prevent duplicate active registrations.
        existing_registration = CampRegistration.objects.filter(
            camp=camp,
            donor=donor,
            status__in=[
                CampRegistration.RegistrationStatus.REGISTERED,
                CampRegistration.RegistrationStatus.ATTENDED
            ]
        ).exists()

        if existing_registration:

            return Response(
                {'error': 'You are already registered for this camp.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create a new registration.
        # Previous cancelled registrations remain in history.
        registration = CampRegistration.objects.create(
            camp=camp,
            donor=donor
        )
        # Notify the donor
        Notification.objects.create(
            recipient=request.user,
            title='Camp Registration Successful',
            message=f'You have successfully registered for the donation camp "{camp.camp_name}" scheduled on {camp.camp_date}.',
            notification_type=Notification.NotificationType.CAMP_UPDATE
        )

        # Notify the blood bank
        Notification.objects.create(
            recipient=camp.blood_bank.user,
            title='New Camp Registration',
            message=f'{donor.full_name} has registered for your donation camp "{camp.camp_name}".',
            notification_type=Notification.NotificationType.CAMP_UPDATE
        )

        serializer = CampRegistrationSerializer(registration)

        return Response(
            {
                'message': 'Successfully registered for the camp.',
                'registration': serializer.data
            },
            status=status.HTTP_201_CREATED
        )


# --------------------------------------------------
# 4. DONOR VIEWS OWN CAMP REGISTRATIONS
# GET /api/camps/my-registrations/
# --------------------------------------------------

class MyCampRegistrationsView(generics.ListAPIView):

    serializer_class = CampRegistrationSerializer
    permission_classes = [IsDonor]

    def get_queryset(self):

        return CampRegistration.objects.filter(
            donor=self.request.user.donor_profile
        ).select_related(
            'camp',
            'camp__district'
        ).order_by(
            '-registration_date'
        )


# --------------------------------------------------
# 5. DONOR CANCELS OWN REGISTRATION
# POST /api/camps/registrations/<id>/cancel/
# --------------------------------------------------

class CampRegistrationCancelView(APIView):

    permission_classes = [IsDonor]

    @transaction.atomic
    def post(self, request, pk):

        try:

            registration = CampRegistration.objects.select_for_update().get(
                pk=pk,
                donor=request.user.donor_profile
            )

        except CampRegistration.DoesNotExist:

            return Response(
                {'error': 'Registration not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only registered donors can cancel.
        if registration.status != CampRegistration.RegistrationStatus.REGISTERED:

            return Response(
                {'error': 'Only active registrations can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        camp = registration.camp

        now = timezone.localtime()

        if (
            camp.camp_date < now.date()
            or (
                camp.camp_date == now.date()
                and camp.start_time <= now.time()
            )
        ):

            return Response(
                {'error': 'Registration cannot be cancelled after the camp has started.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        registration.status = CampRegistration.RegistrationStatus.CANCELLED

        registration.save(
            update_fields=['status']
        )
        # Notify the blood bank about cancellation
        Notification.objects.create(
            recipient=camp.blood_bank.user,
            title='Camp Registration Cancelled',
            message=f'{registration.donor.full_name} has cancelled their registration for the donation camp "{camp.camp_name}".',
            notification_type=Notification.NotificationType.CAMP_UPDATE
        )

        return Response(
            {'message': 'Camp registration cancelled successfully.'},
            status=status.HTTP_200_OK
        )


# --------------------------------------------------
# 6. BANK VIEWS REGISTRATIONS FOR ITS OWN CAMP
# GET /api/camps/<id>/registrations/
# --------------------------------------------------

class BankCampRegistrationListView(generics.ListAPIView):

    serializer_class = CampRegistrationSerializer
    permission_classes = [IsBloodBank]

    def get_queryset(self):

        if not is_approved_blood_bank(self.request.user):
            return CampRegistration.objects.none()

        return CampRegistration.objects.filter(
            camp_id=self.kwargs['pk'],
            camp__blood_bank__user=self.request.user
        ).select_related(
            'donor',
            'camp'
        ).order_by(
            '-registration_date'
        )


# --------------------------------------------------
# 7. BANK MARKS DONOR ATTENDANCE
# POST /api/camps/registrations/<id>/attendance/
# --------------------------------------------------

class CampAttendanceUpdateView(APIView):

    permission_classes = [IsBloodBank]

    @transaction.atomic
    def post(self, request, pk):

        if not is_approved_blood_bank(request.user):

            raise PermissionDenied(
                'Only approved blood banks can update attendance.'
            )

        try:

            registration = CampRegistration.objects.select_for_update().get(
                pk=pk,
                camp__blood_bank__user=request.user
            )

        except CampRegistration.DoesNotExist:

            return Response(
                {'error': 'Registration not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only registered donors can be marked attended.
        if registration.status != CampRegistration.RegistrationStatus.REGISTERED:

            return Response(
                {'error': 'Only registered donors can be marked as attended.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        registration.status = CampRegistration.RegistrationStatus.ATTENDED

        registration.save(
            update_fields=['status']
        )
        # Notify the donor about attendance confirmation
        Notification.objects.create(
            recipient=registration.donor.user,
            title='Camp Attendance Confirmed',
            message=f'Your attendance for the donation camp "{registration.camp.camp_name}" has been recorded.',
            notification_type=Notification.NotificationType.CAMP_UPDATE
        )

        return Response(
            {'message': 'Donor attendance recorded successfully.'},
            status=status.HTTP_200_OK
        )


class CampCancelView(APIView):

    permission_classes = [IsBloodBank]

    @transaction.atomic
    def post(self, request, pk):

        if not is_approved_blood_bank(request.user):
            raise PermissionDenied(
                'Only approved blood banks can cancel camps.'
            )

        try:
            camp = DonationCamp.objects.select_for_update().get(
                pk=pk,
                blood_bank__user=request.user
            )

        except DonationCamp.DoesNotExist:
            return Response(
                {'error': 'Camp not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if camp.status != DonationCamp.CampStatus.UPCOMING:
            return Response(
                {'error': 'Only upcoming camps can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        registrations = CampRegistration.objects.filter(
            camp=camp,
            status=CampRegistration.RegistrationStatus.REGISTERED
        ).select_related('donor__user')

        camp.status = DonationCamp.CampStatus.CANCELLED
        camp.save(update_fields=['status'])

        for registration in registrations:
            Notification.objects.create(
                recipient=registration.donor.user,
                title='Donation Camp Cancelled',
                message=(
                    f'The donation camp "{camp.camp_name}", '
                    f'scheduled on {camp.camp_date}, has been cancelled '
                    f'by the organizing blood bank.'
                ),
                notification_type=Notification.NotificationType.CAMP_UPDATE
            )

        return Response(
            {
                'message': 'Camp cancelled successfully. Registered donors have been notified.'
            },
            status=status.HTTP_200_OK
        )