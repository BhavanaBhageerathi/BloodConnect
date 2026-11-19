from django.urls import path

from .views import (
    AdminDashboardView,
    AdminUserListView,
    AdminUserStatusView,
    AdminBloodBankListView,
    AdminBloodBankReviewView,
    AdminVerificationListView,
    AdminBloodRequestListView,
    AdminInventoryListView,
    AdminDonationListView,
    AdminCampListView,
    AdminCampRegistrationListView,
    AdminNotificationListView
)


urlpatterns = [

    # Dashboard
    path(
        'dashboard/',
        AdminDashboardView.as_view(),
        name='admin-dashboard'
    ),

    # User Management
    path(
        'users/',
        AdminUserListView.as_view(),
        name='admin-users'
    ),

    path(
        'users/<int:pk>/status/',
        AdminUserStatusView.as_view(),
        name='admin-user-status'
    ),

    # Blood Bank Management
    path(
        'blood-banks/',
        AdminBloodBankListView.as_view(),
        name='admin-blood-banks'
    ),

    path(
        'blood-banks/<int:pk>/review/',
        AdminBloodBankReviewView.as_view(),
        name='admin-blood-bank-review'
    ),

    # Donor Verification
    path(
        'verifications/',
        AdminVerificationListView.as_view(),
        name='admin-verifications'
    ),

    # Blood Requests
    path(
        'blood-requests/',
        AdminBloodRequestListView.as_view(),
        name='admin-blood-requests'
    ),

    # Inventory
    path(
        'inventory/',
        AdminInventoryListView.as_view(),
        name='admin-inventory'
    ),

    # Donations
    path(
        'donations/',
        AdminDonationListView.as_view(),
        name='admin-donations'
    ),

    # Camps
    path(
        'camps/',
        AdminCampListView.as_view(),
        name='admin-camps'
    ),

    # Camp Registrations
    path(
        'camp-registrations/',
        AdminCampRegistrationListView.as_view(),
        name='admin-camp-registrations'
    ),

    # Notifications
    path(
        'notifications/',
        AdminNotificationListView.as_view(),
        name='admin-notifications'
    ),

]