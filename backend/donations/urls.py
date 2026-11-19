from django.urls import path
from .views import (
    BloodBankDonorInvitationListView,
    DonorInvitationListView,
    DonorInvitationResponseView,
    DonationCompletionView,
    DonorDonationHistoryView,
    BloodBankDonationHistoryView,
    EligibleDonorListView,
    BloodBankSendInvitationView,
    BloodBankDonationRequestListView,
    HealthVerificationView,
    BloodBankDonationManagementView,
)

urlpatterns = [
    path('my-invitations/', DonorInvitationListView.as_view(), name='donor-invitations'),
    path('my-invitations/<int:id>/respond/', DonorInvitationResponseView.as_view(), name='donor-invitation-response'),
    path('bank/invitations/', BloodBankDonorInvitationListView.as_view(), name='bank-donor-invitations'),
    path('bank/donations/complete/', DonationCompletionView.as_view(), name='donation-complete'),
    path('my-history/', DonorDonationHistoryView.as_view(), name='my_donation_history'),
    path('bank/donations/history/', BloodBankDonationHistoryView.as_view(), name='bank_donation_history'),
    path('bank/eligible-donors/',EligibleDonorListView.as_view(),name='eligible-donors'),
    path('bank/send-invitations/',BloodBankSendInvitationView.as_view(),name='bank-send-invitations'),
    path('bank/donation-requests/',BloodBankDonationRequestListView.as_view(),name='bank-donation-requests'),
    path('bank/health-verification/',HealthVerificationView.as_view(),name='bank-health-verification'),
    path('bank/donation-management/',BloodBankDonationManagementView.as_view(),name='bank-donation-management'),




]
