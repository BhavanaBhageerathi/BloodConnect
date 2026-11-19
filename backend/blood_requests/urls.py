from django.urls import path
from .views import BloodBankRequestListView, BloodRequestCreateView, BloodRequestReviewView, RequestTrackingView, RequesterBloodRequestDetailView, RequesterBloodRequestListView, RequesterCancelBloodRequestView

urlpatterns = [
    path('create/', BloodRequestCreateView.as_view(), name='create_blood_request'),
    path('bank/requests/', BloodBankRequestListView.as_view(), name='bank_request_list'),
    path('bank/requests/<int:id>/review/', BloodRequestReviewView.as_view(), name='review_blood_request'),
    path('my-requests/',RequesterBloodRequestListView.as_view(),name='requester_blood_requests'),
    path('my-requests/<int:pk>/',RequesterBloodRequestDetailView.as_view(),name='requester-request-detail'),
    path('track/<int:request_id>/',RequestTrackingView.as_view(),name='request-tracking'),
    path('my-requests/<int:request_id>/cancel/', RequesterCancelBloodRequestView.as_view(), name='cancel-blood-request'),
]