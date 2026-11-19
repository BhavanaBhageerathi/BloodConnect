from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from blood_requests.models import RequestStatusHistory

from .models import DonorInvitation, DonationRequest,DonationRecord
from .serializers import DonorInvitationSerializer, BloodBankDonorInvitationSerializer, DonorDonationHistorySerializer, BloodBankDonationHistorySerializer
from permissions import IsBloodBank, IsDonor
from accounts.models import DonorProfile
from verification.models import DonorVerification
from .serializers import DonorInvitationCreateSerializer
from .serializers import DonationRequestListSerializer
from django.utils import timezone



from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from notifications.models import Notification
from .serializers import DonorInvitationResponseSerializer, DonationCompletionSerializer
from .services import complete_donation

from accounts.models import DonorProfile
from verification.models import DonorVerification
from .serializers import EligibleDonorSerializer



class DonorInvitationListView(generics.ListAPIView):

    serializer_class = DonorInvitationSerializer
    permission_classes = [IsAuthenticated, IsDonor]

    def get_queryset(self):
        return DonorInvitation.objects.filter(
            donor__user=self.request.user
        ).select_related(
            'donation_request',
            'donation_request__blood_bank',
            'donation_request__district'
        ).order_by('-sent_at')




class DonorInvitationResponseView(APIView):
    permission_classes = [IsAuthenticated, IsDonor]

    @transaction.atomic
    def patch(self, request, id):

        # First, identify the donation request belonging to this donor's invitation.
        invitation_info = get_object_or_404(
            DonorInvitation,
            id=id,
            donor__user=request.user
        )

        # Lock the donation request first.
        donation_request = get_object_or_404(
            DonationRequest.objects.select_for_update(),
            id=invitation_info.donation_request_id
        )

        # Then lock the individual invitation.
        invitation = get_object_or_404(
            DonorInvitation.objects.select_for_update(),
            id=id,
            donor__user=request.user
        )

        if invitation.status != 'PENDING':
            return Response(
                {'error': 'You have already responded to this invitation.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if donation_request.status in ['FULFILLED', 'CANCELLED']:
            return Response(
                {'error': 'This donation request is no longer accepting responses.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DonorInvitationResponseSerializer(data=request.data)

        if serializer.is_valid():

            response_status = serializer.validated_data['status']

            if response_status == 'ACCEPTED':

                # Count donors already selected for this donation request.
                selected_count = DonorInvitation.objects.filter(
                    donation_request=donation_request,
                    status='SELECTED'
                ).count()

                

                if selected_count < donation_request.units_required:

                    # Automatically select this donor.
                    invitation.status = 'SELECTED'
                    blood_request = donation_request.blood_request
                    
                    if blood_request.status != 'DONATION_COORDINATED':
                        blood_request.status = 'DONATION_COORDINATED'
                        blood_request.save(update_fields=['status'])
    
                        RequestStatusHistory.objects.create(
                            blood_request=blood_request,
                            status='DONATION_COORDINATED',
                            updated_by=request.user
                        )

                    donation_request.status = 'IN_PROGRESS'
                    donation_request.save(update_fields=['status'])

                    selection_message = (
                        'You have been selected for this donation request.'
                    )

                    # Notify the selected donor.
                    Notification.objects.create(
                        recipient=invitation.donor.user,
                        title='Donation Invitation Selected',
                        message=selection_message,
                        notification_type='DONATION_INVITATION'
                    )

                else:

                    # Required number of donors has already been selected.
                    invitation.status = 'ACCEPTED'

            else:
                invitation.status = 'DECLINED'

            invitation.responded_at = timezone.now()

            invitation.save(
                update_fields=['status', 'responded_at']
            )

            # Notify the blood bank.
            Notification.objects.create(
                recipient=donation_request.blood_bank.user,
                title='Donor Invitation Response',
                message=(
                    f'{invitation.donor.full_name} has '
                    f'{invitation.status.lower()} your donation invitation.'
                ),
                notification_type='DONATION_RESPONSE'
            )

            return Response(
                {
                    'message': 'Your response has been submitted successfully.',
                    'invitation_id': invitation.id,
                    'status': invitation.status,
                    'responded_at': invitation.responded_at
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    
class BloodBankDonorInvitationListView(generics.ListAPIView):
    serializer_class = BloodBankDonorInvitationSerializer
    permission_classes = [IsAuthenticated, IsBloodBank]

    def get_queryset(self):
        return DonorInvitation.objects.filter(
            donation_request__blood_bank__user=self.request.user
        ).select_related(
            'donor',
            'donor__district',
            'donation_request'
        ).order_by('-sent_at')
    


class DonationCompletionView(APIView):
    permission_classes = [IsAuthenticated, IsBloodBank]

    def post(self, request):

        # Only approved blood banks can record donations
        blood_bank = request.user.blood_bank_profile

        if blood_bank.verification_status != 'APPROVED':
            return Response(
                {'error': 'Your blood bank is not approved.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = DonationCompletionSerializer(data=request.data)

        if serializer.is_valid():

            invitation_id = serializer.validated_data['invitation_id']
            donation_date = serializer.validated_data['donation_date']

            # Ensure the invitation belongs to this blood bank
            invitation = get_object_or_404(
                DonorInvitation,
                id=invitation_id,
                donation_request__blood_bank=blood_bank
            )

            try:
                donation_record = complete_donation(
                    invitation,
                    donation_date
                )

                return Response(
                    {
                        'message': 'Donation completed successfully.',
                        'donation_record_id': donation_record.id,
                        'donor_name': donation_record.donor.full_name,
                        'blood_group': donation_record.blood_group,
                        'units_donated': donation_record.units_donated
                    },
                    status=status.HTTP_201_CREATED
                )

            except ValueError as error:
                return Response(
                    {'error': str(error)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class DonorDonationHistoryView(generics.ListAPIView):

    serializer_class = DonorDonationHistorySerializer
    permission_classes = [IsAuthenticated, IsDonor]

    def get_queryset(self):

        return DonationRecord.objects.filter(
            donor__user=self.request.user
        ).select_related(
            'blood_bank'
        ).order_by('-donation_date')


class BloodBankDonationHistoryView(generics.ListAPIView):

    serializer_class = BloodBankDonationHistorySerializer
    permission_classes = [IsAuthenticated, IsBloodBank]

    def get_queryset(self):

        return DonationRecord.objects.filter(
            blood_bank__user=self.request.user
        ).select_related(
            'donor',
            'blood_bank'
        ).order_by('-donation_date')

class EligibleDonorListView(generics.ListAPIView):

    serializer_class = EligibleDonorSerializer

    permission_classes = [IsAuthenticated, IsBloodBank]

    def get_queryset(self):

        blood_bank = self.request.user.blood_bank_profile

        # Only approved blood banks can access eligible donors
        if blood_bank.verification_status != 'APPROVED':
            return DonorProfile.objects.none()

        donors = DonorProfile.objects.filter(
            availability_status=True
        ).select_related(
            'user',
            'district'
        )

        eligible_donors = []

        for donor in donors:

            # Check whether the donor's latest verification
            # application is approved
            latest_verification = DonorVerification.objects.filter(
                donor=donor
            ).order_by('-application_date').first()

            if not latest_verification:
                continue

            if latest_verification.status != 'APPROVED':
                continue

            # Check the donor's eligibility
            if donor.is_available_for_donation:
                eligible_donors.append(donor)

        # Convert the eligible donors into a queryset
        donor_ids = [donor.id for donor in eligible_donors]

        queryset = DonorProfile.objects.filter(
            id__in=donor_ids
        ).select_related(
            'user',
            'district'
        )

        # Filter by blood group
        blood_group = self.request.query_params.get('blood_group')

        if blood_group:
            queryset = queryset.filter(
                blood_group=blood_group
            )

        # Filter by district
        district = self.request.query_params.get('district')

        if district:
            queryset = queryset.filter(
                district_id=district
            )

        # Search donor by name
        search = self.request.query_params.get('search')

        if search:
            queryset = queryset.filter(
                full_name__icontains=search
            )

        return queryset.order_by('full_name')



class BloodBankSendInvitationView(APIView):

    permission_classes = [IsAuthenticated, IsBloodBank]

    @transaction.atomic
    def post(self, request):

        blood_bank = request.user.blood_bank_profile

        # Check whether the blood bank is approved
        if blood_bank.verification_status != 'APPROVED':
            return Response(
                {
                    'error': 'Your blood bank is not approved.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate the request data
        serializer = DonorInvitationCreateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        donation_request_id = serializer.validated_data[
            'donation_request_id'
        ]

        donor_ids = serializer.validated_data['donor_ids']

        # Retrieve the donation request belonging to this blood bank
        donation_request = get_object_or_404(
            DonationRequest,
            id=donation_request_id,
            blood_bank=blood_bank
        )

        # Check whether the donation request is open
        if donation_request.status != 'OPEN':
            return Response(
                {
                    'error': 'This donation request is not open.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        invited_donors = []
        skipped_donors = []

        for donor_id in donor_ids:

            donor = DonorProfile.objects.filter(
                id=donor_id
            ).select_related(
                'user',
                'district'
            ).first()

            # Donor does not exist
            if not donor:
                skipped_donors.append({
                    'donor_id': donor_id,
                    'reason': 'Donor not found.'
                })
                continue

            # Check the donor's latest verification application
            latest_verification = DonorVerification.objects.filter(
                donor=donor
            ).order_by('-application_date').first()

            if not latest_verification:
                skipped_donors.append({
                    'donor_id': donor.id,
                    'reason': 'Donor has not been verified.'
                })
                continue

            if latest_verification.status != 'APPROVED':
                skipped_donors.append({
                    'donor_id': donor.id,
                    'reason': 'Donor verification is not approved.'
                })
                continue

            # Check donor eligibility and availability
            if not donor.is_available_for_donation:
                skipped_donors.append({
                    'donor_id': donor.id,
                    'reason': 'Donor is not currently eligible or available.'
                })
                continue

            # Check blood group compatibility with the donation request
            if donor.blood_group != donation_request.blood_group:
                skipped_donors.append({
                    'donor_id': donor.id,
                    'reason': 'Donor blood group does not match the donation request.'
                })
                continue

            # Prevent duplicate invitations
            invitation, created = DonorInvitation.objects.get_or_create(
                donation_request=donation_request,
                donor=donor
            )

            if not created:
                skipped_donors.append({
                    'donor_id': donor.id,
                    'reason': 'This donor has already been invited.'
                })
                continue

            # Generate personalized invitation message
            invitation_message = f"""
Dear {donor.full_name},

We are pleased to invite you to donate blood at {blood_bank.blood_bank_name}.
Your willingness to donate blood can help save lives and support patients in need.

We are currently looking for donors with {donation_request.blood_group} blood group.

Invitation Details:

Donor Name: {donor.full_name}
Blood Group: {donor.blood_group}
Blood Bank: {blood_bank.blood_bank_name}
Contact Person: {blood_bank.contact_person}
Contact Number: {blood_bank.user.phone}
Location: {blood_bank.address}
District: {blood_bank.district.name}

If you are available and willing to donate blood, please respond to this invitation through BloodConnect.

Your contribution can make a difference and help save someone's life.

Thank you for being a lifesaver!

Regards,
{blood_bank.blood_bank_name}
BloodConnect
"""

            # Create notification for the donor
            Notification.objects.create(
                recipient=donor.user,
                title=f"Blood Donation Invitation from {blood_bank.blood_bank_name}",
                message=invitation_message,
                notification_type='DONATION_INVITATION',
                related_request=donation_request.blood_request
            )

            invited_donors.append({
                'donor_id': donor.id,
                'donor_name': donor.full_name,
                'invitation_id': invitation.id
            })

        return Response(
            {
                'message': 'Invitation processing completed.',
                'total_invitations_sent': len(invited_donors),
                'invited_donors': invited_donors,
                'total_donors_skipped': len(skipped_donors),
                'skipped_donors': skipped_donors
            },
            status=status.HTTP_201_CREATED
        )

class BloodBankDonationRequestListView(generics.ListAPIView):

    serializer_class = DonationRequestListSerializer

    permission_classes = [
        IsAuthenticated,
        IsBloodBank
    ]

    def get_queryset(self):

        blood_bank = self.request.user.blood_bank_profile

        # Only approved blood banks can access donation requests
        if blood_bank.verification_status != 'APPROVED':
            return DonationRequest.objects.none()

        return DonationRequest.objects.filter(
            blood_bank=blood_bank,
            status='OPEN'
        ).select_related(
            'district'
        ).order_by('-created_at')


class BloodBankDonationManagementView(APIView):
    permission_classes = [IsAuthenticated, IsBloodBank]

    def get(self, request):
        blood_bank = request.user.blood_bank_profile

        # Ensure Blood Bank is approved
        if blood_bank.verification_status != 'APPROVED':
            return Response(
                {"error": "Your Blood Bank is not approved."},
                status=status.HTTP_403_FORBIDDEN
            )

        invitations = DonorInvitation.objects.filter(
            donation_request__blood_bank=blood_bank,
            status__in=['SELECTED', 'HEALTH_VERIFIED']
        ).select_related(
            'donor',
            'donor__user',
            'donation_request',
            'donation_request__district'
        ).order_by('-sent_at')

        serializer = BloodBankDonorInvitationSerializer(
            invitations,
            many=True
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class HealthVerificationView(APIView):

    permission_classes = [IsAuthenticated, IsBloodBank]

    @transaction.atomic
    def post(self, request):

        blood_bank = request.user.blood_bank_profile

        # Only approved blood banks can verify donor health
        if blood_bank.verification_status != 'APPROVED':
            return Response(
                {'error': 'Your blood bank is not approved.'},
                status=status.HTTP_403_FORBIDDEN
            )

        invitation_id = request.data.get('invitation_id')

        if not invitation_id:
            return Response(
                {'error': 'Invitation ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lock the invitation to prevent simultaneous processing
        invitation = get_object_or_404(
            DonorInvitation.objects.select_for_update(),
            id=invitation_id,
            donation_request__blood_bank=blood_bank
        )

        # Only selected donors can undergo health verification
        if invitation.status != 'SELECTED':
            return Response(
                {
                    'error': (
                        'Only selected donors can undergo '
                        'health verification.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update invitation status
        invitation.status = 'HEALTH_VERIFIED'
        invitation.health_verified_at = timezone.now()
        invitation.health_verified_by = request.user

        invitation.save(
            update_fields=[
                'status',
                'health_verified_at',
                'health_verified_by'
            ]
        )

        return Response(
            {
                'message': 'Donor health has been verified successfully.',
                'invitation_id': invitation.id,
                'status': invitation.status,
                'health_verified_at': invitation.health_verified_at
            },
            status=status.HTTP_200_OK
        )

