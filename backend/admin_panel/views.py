from django.shortcuts import render

# Create your views here.
from django.db.models import Count
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from permissions import IsAdmin

from accounts.models import (
    User,
    DonorProfile,
    RequesterProfile,
    BloodBankProfile
)

from verification.models import DonorVerification
from blood_requests.models import BloodRequest
from inventory.models import BloodUnit
from donations.models import DonationRecord
from camps.models import DonationCamp, CampRegistration
from notifications.models import Notification

from .serializers import (
    AdminUserSerializer,
    AdminUserStatusSerializer,
    AdminBloodBankSerializer,
    AdminBloodBankReviewSerializer,
    AdminVerificationSerializer,
    AdminBloodRequestSerializer,
    AdminBloodUnitSerializer,
    AdminDonationRecordSerializer,
    AdminCampSerializer,
    AdminCampRegistrationSerializer,
    AdminNotificationSerializer
)


# =====================================
# 1. ADMIN DASHBOARD
# =====================================

class AdminDashboardView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        data = {

            'total_users': User.objects.count(),

            'active_users': User.objects.filter(
                is_active=True
            ).count(),

            'inactive_users': User.objects.filter(
                is_active=False
            ).count(),

            'total_donors': DonorProfile.objects.count(),

            'total_requesters': RequesterProfile.objects.count(),

            'total_blood_banks': BloodBankProfile.objects.count(),

            'pending_blood_banks': BloodBankProfile.objects.filter(
                verification_status='PENDING'
            ).count(),

            'approved_blood_banks': BloodBankProfile.objects.filter(
                verification_status='APPROVED'
            ).count(),

            'pending_verifications': DonorVerification.objects.filter(
                status='PENDING'
            ).count(),

            'total_blood_requests': BloodRequest.objects.count(),

            'completed_blood_requests': BloodRequest.objects.filter(
                status='COMPLETED'
            ).count(),

            'total_donations': DonationRecord.objects.count(),

            'total_blood_units': BloodUnit.objects.count(),

            'available_blood_units': BloodUnit.objects.filter(
                status='AVAILABLE'
            ).count(),

            'total_camps': DonationCamp.objects.count(),

            'total_camp_registrations': CampRegistration.objects.count()

        }

        return Response(data, status=status.HTTP_200_OK)


# =====================================
# 2. USER MANAGEMENT
# =====================================

class AdminUserListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = User.objects.select_related(
            'donor_profile',
            'requester_profile',
            'blood_bank_profile'
        ).order_by('-date_joined')

        role = request.query_params.get('role')

        active = request.query_params.get('is_active')

        if role:

            if role not in User.Role.values:

                return Response(
                    {'error': 'Invalid role.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            queryset = queryset.filter(role=role)

        if active in ['true', 'false']:

            queryset = queryset.filter(
                is_active=(active == 'true')
            )

        serializer = AdminUserSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


class AdminUserStatusView(APIView):

    permission_classes = [IsAdmin]

    def patch(self, request, pk):

        user = get_object_or_404(User, pk=pk)

        if user.pk == request.user.pk:

            return Response(
                {'error': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AdminUserStatusSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user.is_active = serializer.validated_data['is_active']

        user.save(update_fields=['is_active'])

        return Response({

            'message': 'User status updated successfully.',

            'user_id': user.id,

            'is_active': user.is_active

        }, status=status.HTTP_200_OK)


# =====================================
# 3. BLOOD BANK MANAGEMENT
# =====================================

class AdminBloodBankListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = BloodBankProfile.objects.select_related(
            'user',
            'district'
        ).order_by('-id')

        bank_status = request.query_params.get('status')

        if bank_status:

            if bank_status not in BloodBankProfile.VerificationStatus.values:

                return Response(
                    {'error': 'Invalid verification status.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            queryset = queryset.filter(
                verification_status=bank_status
            )

        serializer = AdminBloodBankSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


class AdminBloodBankReviewView(APIView):

    permission_classes = [IsAdmin]

    def patch(self, request, pk):

        bank = get_object_or_404(
            BloodBankProfile,
            pk=pk
        )

        serializer = AdminBloodBankReviewSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        bank.verification_status = serializer.validated_data[
            'verification_status'
        ]

        bank.save(update_fields=['verification_status'])

        return Response({

            'message': 'Blood bank reviewed successfully.',

            'id': bank.id,

            'verification_status': bank.verification_status

        }, status=status.HTTP_200_OK)


# =====================================
# 4. DONOR VERIFICATION MONITORING
# =====================================

class AdminVerificationListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = DonorVerification.objects.select_related(
            'donor__user',
            'blood_bank',
            'reviewed_by'
        ).order_by('-application_date')

        application_status = request.query_params.get('status')

        if application_status:

            queryset = queryset.filter(
                status=application_status
            )

        serializer = AdminVerificationSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


# =====================================
# 5. BLOOD REQUEST MONITORING
# =====================================

class AdminBloodRequestListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = BloodRequest.objects.select_related(
            'requester__user',
            'blood_bank',
            'district'
        ).order_by('-created_at')

        request_status = request.query_params.get('status')

        if request_status:

            queryset = queryset.filter(
                status=request_status
            )

        serializer = AdminBloodRequestSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


# =====================================
# 6. INVENTORY MONITORING
# =====================================

class AdminInventoryListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = BloodUnit.objects.select_related(
            'blood_bank__district',
            'donation_record'
        ).order_by(
            'blood_bank__blood_bank_name',
            'blood_group'
        )

        bank_id = request.query_params.get('blood_bank')

        blood_group = request.query_params.get('blood_group')

        unit_status = request.query_params.get('status')

        if bank_id:
            queryset = queryset.filter(
                blood_bank_id=bank_id
            )

        if blood_group:
            queryset = queryset.filter(
                blood_group=blood_group
            )

        if unit_status:
            queryset = queryset.filter(
                status=unit_status
            )

        serializer = AdminBloodUnitSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


# =====================================
# 7. DONATION MONITORING
# =====================================

class AdminDonationListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = DonationRecord.objects.select_related(
            'donor__user',
            'blood_bank'
        ).order_by('-donation_date')

        donation_status = request.query_params.get('status')

        if donation_status:
            queryset = queryset.filter(
                status=donation_status
            )

        serializer = AdminDonationRecordSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


# =====================================
# 8. CAMP MONITORING
# =====================================

class AdminCampListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = DonationCamp.objects.select_related(
            'blood_bank',
            'district'
        ).annotate(
            registration_total=Count('registrations')
        ).order_by('-camp_date')

        camp_status = request.query_params.get('status')

        if camp_status:
            queryset = queryset.filter(
                status=camp_status
            )

        serializer = AdminCampSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


# =====================================
# 9. CAMP REGISTRATION MONITORING
# =====================================

class AdminCampRegistrationListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = CampRegistration.objects.select_related(
            'camp__blood_bank',
            'donor'
        ).order_by('-registration_date')

        registration_status = request.query_params.get('status')

        if registration_status:
            queryset = queryset.filter(
                status=registration_status
            )

        serializer = AdminCampRegistrationSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)


# =====================================
# 10. ADMIN NOTIFICATIONS
# =====================================

class AdminNotificationListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        queryset = Notification.objects.filter(
            recipient=request.user
        ).order_by('-created_at')

        serializer = AdminNotificationSerializer(
            queryset,
            many=True
        )

        return Response(serializer.data)