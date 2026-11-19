from django.urls import path
from .views import BloodBankVerificationListView, DonorVerificationSubmitView,DonorVerificationReviewView, MyVerificationStatusView


urlpatterns = [
    path('submit/',DonorVerificationSubmitView.as_view(),name='submit_verification'),
    path('bank/applications/',BloodBankVerificationListView.as_view(),name='bank_verification_list'),
    path('bank/applications/<int:id>/review/',DonorVerificationReviewView.as_view(),name='review_verification'),
    path('my-status/', MyVerificationStatusView.as_view(), name='my_verification_status'),

]