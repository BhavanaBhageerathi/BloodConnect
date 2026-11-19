from rest_framework import generics

from blood_requests.models import RequestStatusHistory, BloodRequest
from notifications.models import Notification
from .models import BloodStockThreshold, BloodUnit, BloodAllocation
from .serializers import BloodUnitSerializer, BloodStockThresholdSerializer, BloodAllocationSerializer
from permissions import IsBloodBank
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.utils.timezone import localdate
from .services import check_low_stock, calculate_expiry_date 
from rest_framework import status



class BloodBankInventoryListView(generics.ListAPIView):
    serializer_class = BloodUnitSerializer
    permission_classes = [IsBloodBank]

    def get_queryset(self):

        queryset = BloodUnit.objects.filter(
            blood_bank__user=self.request.user
        )

        # Allowed blood groups
        valid_blood_groups = [
            'A+', 'A-', 'B+', 'B-',
            'AB+', 'AB-', 'O+', 'O-'
        ]

        # Allowed statuses
        valid_statuses = [
            'AVAILABLE', 'RESERVED', 'ISSUED', 'EXPIRED'
        ]

        blood_group = self.request.query_params.get('blood_group')
        inventory_status = self.request.query_params.get('status')

        if blood_group:
            if blood_group not in valid_blood_groups:
                raise ValidationError({
                    'blood_group': 'Invalid blood group.'
                })

            queryset = queryset.filter(blood_group=blood_group)

        if inventory_status:
            if inventory_status not in valid_statuses:
                raise ValidationError({
                    'status': 'Invalid inventory status.'
                })

            queryset = queryset.filter(status=inventory_status)

        return queryset.order_by('-collection_date')

class BloodInventorySummaryView(APIView):
    permission_classes = [IsBloodBank]

    def get(self, request):

        blood_bank = request.user.blood_bank_profile

        summary = {}

        blood_groups = [
            'A+', 'A-', 'B+', 'B-',
            'AB+', 'AB-', 'O+', 'O-'
        ]

        for group in blood_groups:

            available_count = BloodUnit.objects.filter(
                blood_bank=blood_bank,
                blood_group=group,
                status='AVAILABLE',
                expiry_date__gte=localdate()
            ).count()

            summary[group] = available_count

        return Response(summary)


class BloodStockThresholdListView(generics.ListAPIView):
    serializer_class = BloodStockThresholdSerializer
    permission_classes = [IsBloodBank]

    def get_queryset(self):
        return BloodStockThreshold.objects.filter(
            blood_bank__user=self.request.user
        ).order_by('blood_group')


class BloodStockThresholdManagementView(generics.ListCreateAPIView):

    serializer_class = BloodStockThresholdSerializer
    permission_classes = [IsBloodBank]

    def get_queryset(self):
        return BloodStockThreshold.objects.filter(
            blood_bank__user=self.request.user
        ).order_by('blood_group')

    def perform_create(self, serializer):
        serializer.save(
            blood_bank=self.request.user.blood_bank_profile
        )

class BloodStockThresholdUpdateView(generics.UpdateAPIView):

    serializer_class = BloodStockThresholdSerializer
    permission_classes = [IsBloodBank]
    http_method_names = ['patch', 'put', 'head', 'options']

    def get_queryset(self):
        return BloodStockThreshold.objects.filter(
            blood_bank__user=self.request.user
        )


class BloodBankAllocationListView(generics.ListAPIView):

    serializer_class = BloodAllocationSerializer
    permission_classes = [IsBloodBank]

    def get_queryset(self):
        return BloodAllocation.objects.filter(
            blood_request__blood_bank__user=self.request.user,
            status='RESERVED'
        ).select_related(
            'blood_request',
            'blood_unit'
        ).order_by('blood_unit__expiry_date')


class BloodAllocationIssueView(APIView):
    permission_classes = [IsBloodBank]

    @transaction.atomic
    def post(self, request, pk):

        # Step 1: Lock and retrieve the allocation
        try:
            allocation = BloodAllocation.objects.select_for_update().select_related(
                'blood_request',
                'blood_unit'
            ).get(
                id=pk,
                blood_request__blood_bank__user=request.user
            )
        except BloodAllocation.DoesNotExist:
            return Response(
                {'error': 'Allocation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Step 2: Check allocation status
        if allocation.status != 'RESERVED':
            return Response(
                {'error': 'Only reserved allocations can be issued.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 3: Lock the blood unit
        blood_unit = BloodUnit.objects.select_for_update().get(
            id=allocation.blood_unit_id
        )

        if blood_unit.status != 'RESERVED':
            return Response(
                {'error': 'This blood unit is not currently reserved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 4: Check expiry
        if blood_unit.expiry_date < localdate():
            return Response(
                {'error': 'Cannot issue an expired blood unit.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Lock the blood request to prevent concurrent issuance updates
        blood_request = BloodRequest.objects.select_for_update().get(
            id=allocation.blood_request_id
        )

    
        # Step 5: Mark allocation as issued
        allocation.status = 'ISSUED'
        allocation.issued_at = timezone.now()
        allocation.save(update_fields=['status', 'issued_at'])

        # Step 6: Mark blood unit as issued
        blood_unit.status = 'ISSUED'
        blood_unit.save(update_fields=['status'])

        # Step 7: Count the units issued for this request
        issued_count = BloodAllocation.objects.filter(
            blood_request=blood_request,
            status='ISSUED'
        ).count()

        # Step 8: Update blood request status
        if issued_count >= blood_request.units_required:
            new_status = 'COMPLETED'
        else:
            new_status = 'PARTIALLY_FULFILLED'

        if blood_request.status != new_status:
            blood_request.status = new_status
            blood_request.save(update_fields=['status'])

            RequestStatusHistory.objects.create(
                blood_request=blood_request,
                status=new_status,
                updated_by=request.user
            )

        # Step 9: Notify the requester
        Notification.objects.create(
            recipient=blood_request.requester.user,
            title='Blood Unit Issued',
            message=(
                f'{blood_request.blood_group} blood unit has been issued '
                f'for your request #{blood_request.id}. '
                f'Issued units: {issued_count}/{blood_request.units_required}.'
            ),
            notification_type='REQUEST_UPDATE',
            related_request=blood_request
        )

        # Step 10: Check blood bank stock levels
        check_low_stock(blood_request.blood_bank)

        # Step 11: Return response
        return Response(
            {
                'message': 'Blood unit issued successfully.',
                'issued_units': issued_count,
                'required_units': blood_request.units_required,
                'request_status': blood_request.status
            },
            status=status.HTTP_200_OK
        )



class ManualBloodUnitCreateView(APIView):

    permission_classes = [IsBloodBank]

    @transaction.atomic
    def post(self, request):

        blood_bank = request.user.blood_bank_profile

        # Check Blood Bank approval
        if blood_bank.verification_status != 'APPROVED':
            return Response(
                {
                    'error': 'Your Blood Bank is not approved.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        blood_group = request.data.get('blood_group')
        units = request.data.get('units')
        collection_date = request.data.get('collection_date')

        # Validate blood group
        valid_blood_groups = [
            'A+', 'A-', 'B+', 'B-',
            'AB+', 'AB-', 'O+', 'O-'
        ]

        if blood_group not in valid_blood_groups:
            return Response(
                {
                    'error': 'Invalid blood group.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate number of units
        try:
            units = int(units)

            if units <= 0:
                raise ValueError

        except (TypeError, ValueError):
            return Response(
                {
                    'error': 'Units must be a positive integer.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate collection date
        if not collection_date:
            return Response(
                {
                    'error': 'Collection date is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from datetime import date

            collection_date = date.fromisoformat(
                collection_date
            )

        except (ValueError, TypeError):
            return Response(
                {
                    'error': 'Invalid collection date.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Collection date cannot be in the future
        if collection_date > localdate():
            return Response(
                {
                    'error': 'Collection date cannot be in the future.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate expiry date
        expiry_date = calculate_expiry_date(
            collection_date
        )

        # Check whether the blood is already expired
        if expiry_date < localdate():
            return Response(
                {
                    'error': 'Cannot add expired blood units.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create blood units
        created_units = []

        for _ in range(units):

            blood_unit = BloodUnit.objects.create(
                blood_bank=blood_bank,
                donation_record=None,
                source='MANUAL',
                manual_added_by=request.user,
                blood_group=blood_group,
                collection_date=collection_date,
                expiry_date=expiry_date,
                status='AVAILABLE'
            )

            created_units.append(blood_unit)

        # Check low stock after adding units
        check_low_stock(blood_bank)

        return Response(
            {
                'message': f'{units} blood unit(s) added successfully.',
                'blood_group': blood_group,
                'units_added': units,
                'expiry_date': expiry_date,
                'unit_ids': [
                    unit.id for unit in created_units
                ]
            },
            status=status.HTTP_201_CREATED
        )