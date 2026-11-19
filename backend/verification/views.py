from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from permissions import IsDonor, IsBloodBank
from rest_framework import status

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone


from .serializers import DonorVerificationSerializer
from .serializers import DonorVerificationReviewSerializer

from rest_framework.generics import ListAPIView
from rest_framework.permissions import BasePermission

from .models import DonorVerification
from notifications.models import Notification

class DonorVerificationSubmitView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Only donors can submit verification applications
        if request.user.role != 'DONOR':
            return Response(
                {"error": "Only donors can submit verification applications."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = DonorVerificationSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():

            # Automatically associate the logged-in donor
            verification = serializer.save(
                donor=request.user.donor_profile
            )

            Notification.objects.create(
                recipient=verification.blood_bank.user,
                title="New Donor Verification Application",
                message=(
                    f"{verification.donor.full_name} has submitted "
                    f"a donor verification application. "
                    f"Please review the application."
                ),
                notification_type='VERIFICATION_UPDATE'
            )

            return Response(
                {
                    "message": "Verification application submitted successfully.",
                    "application": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class BloodBankVerificationListView(ListAPIView):

    serializer_class = DonorVerificationReviewSerializer

    permission_classes = [IsBloodBank]

    def get_queryset(self):

        return DonorVerification.objects.filter(
            blood_bank__user=self.request.user,
            status__in=[
                DonorVerification.VerificationStatus.PENDING,
                DonorVerification.VerificationStatus.MORE_INFO
            ]
        ).select_related('donor', 'blood_bank')


class DonorVerificationReviewView(APIView):

    permission_classes = [IsBloodBank]

    @transaction.atomic
    def patch(self, request, id):

        verification = get_object_or_404(
            DonorVerification.objects.select_for_update(),
            id=id,
            blood_bank__user=request.user
        )

        # Only active applications can be reviewed
        if verification.status not in [
            DonorVerification.VerificationStatus.PENDING,
            DonorVerification.VerificationStatus.MORE_INFO
        ]:
            return Response(
                {"error": "This application has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DonorVerificationReviewSerializer(
            verification,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save(
                reviewed_by=request.user,
                review_date=timezone.now()
            )

            # Create notification for the donor in db
            Notification.objects.create(
                recipient=verification.donor.user,
                title="Donor Verification Update",
                message=(
                    f"Your verification application has been "
                    f"{verification.get_status_display()}. "
                    f"Remarks: {verification.remarks}"
                ),
                notification_type='VERIFICATION_UPDATE'
)

            return Response(
                {
                    "message": "Verification application reviewed successfully.",
                    "application": serializer.data
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class MyVerificationStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Only donors can access this endpoint
        if request.user.role != 'DONOR':
            return Response(
                {"error": "Only donors can view verification status."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get the latest verification application of the logged-in donor
        verification = DonorVerification.objects.filter(
            donor=request.user.donor_profile
        ).select_related(
            'blood_bank'
        ).order_by('-application_date').first()#This is useful because a donor may have previous rejected applications and a newer application.

        # If donor has not submitted any application
        if not verification:
            return Response(
                {
                    "has_application": False,
                    "status": None,
                    "remarks": None,
                    "application_date": None,
                    "blood_bank": None
                },
                status=status.HTTP_200_OK
            )

        # Return the latest application details
        return Response(
            {
                "has_application": True,
                "status": verification.status,
                "remarks": verification.remarks,
                "application_date": verification.application_date,
                "blood_bank": verification.blood_bank.blood_bank_name
            },
            status=status.HTTP_200_OK
        )