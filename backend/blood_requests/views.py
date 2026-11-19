from django.shortcuts import render
from django.shortcuts import get_object_or_404

# Create your views here.
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from permissions import IsRequester, IsBloodBank
from rest_framework.response import Response
from rest_framework import status

from rest_framework import generics
from rest_framework.permissions import BasePermission


from .serializers import BloodRequestSerializer,  BloodRequestReviewSerializer, RequestStatusHistorySerializer
from .models import BloodRequest, RequestStatusHistory
from notifications.models import Notification

from inventory.services import reserve_blood_units
from donations.services import create_donation_request, create_donor_invitations


class BloodRequestCreateView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        # Check whether the logged-in user is a requester
        if request.user.role != 'REQUESTER':
            return Response(
                {'error': 'Only requesters can submit blood requests.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BloodRequestSerializer(data=request.data)

        if serializer.is_valid():

            blood_request = serializer.save(
                requester=request.user.requester_profile
            )

            # Create initial status history
            RequestStatusHistory.objects.create(
                blood_request=blood_request,
                status=blood_request.status,
                updated_by=request.user
            )

            # Notify the selected blood bank
            Notification.objects.create(
                recipient=blood_request.blood_bank.user,
                title='New Blood Request',
                message=(
                    f'A new blood request has been submitted for '
                    f'{blood_request.patient_name}. '
                    f'Please review the request.'
                ),
                notification_type='BLOOD_REQUEST',
                related_request=blood_request
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class BloodBankRequestListView(generics.ListAPIView):

    serializer_class = BloodRequestSerializer
    permission_classes = [IsBloodBank]

    def get_queryset(self):

        return BloodRequest.objects.filter(
            blood_bank__user=self.request.user
        ).select_related(
            'requester',
            'blood_bank',
            'district'
        ).order_by('-created_at')

class BloodRequestReviewView(APIView):

    permission_classes = [IsBloodBank]

    @transaction.atomic
    def patch(self, request, id):

        # Lock the request row to prevent simultaneous updates
        blood_request = get_object_or_404(
            BloodRequest.objects.select_for_update(),
            id=id,
            blood_bank__user=request.user
        )

        # Check whether the request can be reviewed
        if blood_request.status != 'SUBMITTED':
            return Response(
                {'error': 'This request has already been reviewed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BloodRequestReviewSerializer(data=request.data)

        if serializer.is_valid():

            new_status = serializer.validated_data['status']

            blood_request.status = new_status
            blood_request.rejection_reason = serializer.validated_data.get(
                'rejection_reason', ''
            )

            blood_request.save(update_fields=['status', 'rejection_reason'])

            # Reserve inventory only when the request is accepted
            reserved_units = 0
            shortage = 0

            if new_status == 'ACCEPTED':
                reserved_units = reserve_blood_units(blood_request)

                shortage = blood_request.units_required - reserved_units
                if shortage > 0:
                    donation_request = create_donation_request(
                        blood_request,
                        shortage
                    )

                    create_donor_invitations(donation_request)
                    
            # Record status history
            RequestStatusHistory.objects.create(
                blood_request=blood_request,
                status=new_status,
                updated_by=request.user
            )

            # Notify the requester
            Notification.objects.create(
                recipient=blood_request.requester.user,
                title='Blood Request Update',
                message=(
                    f'Your blood request for {blood_request.patient_name} '
                    f'has been {new_status.lower()}. '
                    f'{blood_request.rejection_reason if new_status == "REJECTED" else ""}'
                ),
                notification_type='REQUEST_UPDATE',
                related_request=blood_request
            )

            return Response(
                {
                    'message': f'Blood request {new_status.lower()} successfully.',
                    'request_id': blood_request.id,
                    'status': blood_request.status,
                    'reserved_units': reserved_units
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



class RequesterBloodRequestListView(generics.ListAPIView):

    serializer_class = BloodRequestSerializer
    permission_classes = [IsRequester]

    def get_queryset(self):

        return BloodRequest.objects.filter(
            requester__user=self.request.user
        ).select_related(
            'requester',
            'blood_bank',
            'district'
        ).order_by('-created_at')


class RequesterBloodRequestDetailView(generics.RetrieveAPIView):

    serializer_class = BloodRequestSerializer
    permission_classes = [IsRequester]


    def get_queryset(self):

        return BloodRequest.objects.filter(
            requester__user=self.request.user
        ).select_related(
            'requester',
            'blood_bank',
            'district'
        )

class RequestTrackingView(APIView):
    permission_classes = [IsRequester]

    def get(self, request, request_id):
        blood_request = get_object_or_404(
            BloodRequest.objects.filter(
                requester__user=request.user
            ),
            id=request_id
        )

        history = RequestStatusHistory.objects.filter(
            blood_request=blood_request
        ).select_related('updated_by').order_by('timestamp')

        history_serializer = RequestStatusHistorySerializer(
            history,
            many=True
        )

        return Response({
            'request_id': blood_request.id,
            'patient_name': blood_request.patient_name,
            'current_status': blood_request.status,
            'status_history': history_serializer.data
        }, status=status.HTTP_200_OK)



class RequesterCancelBloodRequestView(APIView):
    permission_classes = [IsRequester]

    @transaction.atomic
    def post(self, request, request_id):
        blood_request = get_object_or_404(
            BloodRequest.objects.select_for_update().filter(
                requester__user=request.user
            ),
            id=request_id
        )

        if blood_request.status != 'SUBMITTED':
            return Response(
                {'error': 'This request cannot be cancelled at its current stage.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        blood_request.status = 'CANCELLED'
        blood_request.save(update_fields=['status'])

        RequestStatusHistory.objects.create(
            blood_request=blood_request,
            status='CANCELLED',
            updated_by=request.user
        )

        Notification.objects.create(
            recipient=blood_request.blood_bank.user,
            title='Blood Request Cancelled',
            message=f'The blood request for {blood_request.patient_name} has been cancelled by the requester.',
            notification_type='REQUEST_UPDATE',
            related_request=blood_request
        )

        Notification.objects.create(
            recipient=request.user,
            title='Blood Request Cancelled',
            message=f'Your blood request for {blood_request.patient_name} has been cancelled successfully.',
            notification_type='REQUEST_UPDATE',
            related_request=blood_request
        )

        return Response(
            {'message': 'Blood request cancelled successfully.'},
            status=status.HTTP_200_OK
        )
