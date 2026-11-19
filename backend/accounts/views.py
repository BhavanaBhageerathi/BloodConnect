from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import RegisterSerializer
from .serializers import LoginSerializer
from .serializers import (
    DonorProfileSerializer,
    RequesterProfileSerializer,
    BloodBankProfileSerializer,
    ApprovedBloodBankSerializer,
    AdminBloodBankSerializer
)
from permissions import IsAdmin

from .models import DonorProfile, RequesterProfile, BloodBankProfile





class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            # Create user and corresponding profile
            user = serializer.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({

                "message": "Registration successful!",

                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                },

                "access": str(refresh.access_token),

                "refresh": str(refresh)

            }, status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.validated_data['user']

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({

                "message": "Login successful!",

                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                },

                "access": str(refresh.access_token),

                "refresh": str(refresh)

            }, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


#logout view to blacklist the refresh token
class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)

            # Ensure the refresh token belongs to the logged-in user
            if str(token['user_id']) != str(request.user.id):
                return Response(
                    {"error": "Invalid refresh token."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token.blacklist()

            return Response(
                {"message": "Logout successful!"},
                status=status.HTTP_205_RESET_CONTENT
            )

        except TokenError:
            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )

class MyProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get_profile(self, user):

        if user.role == 'DONOR':
            profile = DonorProfile.objects.filter(user=user).first()
            serializer_class = DonorProfileSerializer

        elif user.role == 'REQUESTER':
            profile = RequesterProfile.objects.filter(user=user).first()
            serializer_class = RequesterProfileSerializer

        elif user.role == 'BLOOD_BANK':
            profile = BloodBankProfile.objects.filter(user=user).first()
            serializer_class = BloodBankProfileSerializer

        else:
            return None, None

        return profile, serializer_class

    def get(self, request):

        profile, serializer_class = self.get_profile(request.user)

        if profile is None:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "phone": request.user.phone,
                "role": request.user.role
            },
            "profile": serializer_class(profile).data
        })

    def patch(self, request):

        profile, serializer_class = self.get_profile(request.user)

        if profile is None:
            return Response(
                {"error": "Profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = serializer_class(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response({
                "message": "Profile updated successfully.",
                "profile": serializer.data
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



class ApprovedBloodBanksView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        approved_banks = BloodBankProfile.objects.filter(
            verification_status=BloodBankProfile.VerificationStatus.APPROVED
        ).select_related('district').order_by('blood_bank_name')

        serializer = ApprovedBloodBankSerializer(
            approved_banks,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class AdminBloodBankListView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        blood_banks = BloodBankProfile.objects.select_related(
            'user',
            'district'
        ).order_by('-id')

        serializer = AdminBloodBankSerializer(
            blood_banks,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )