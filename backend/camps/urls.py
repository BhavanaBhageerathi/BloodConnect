from django.urls import path

from .views import (
    CampCancelView,
    CampListCreateView,
    CampUpdateView,
    CampRegistrationCreateView,
    MyCampRegistrationsView,
    CampRegistrationCancelView,
    BankCampRegistrationListView,
    CampAttendanceUpdateView,
)

urlpatterns = [

    # Browse camps and create a camp
    path('',CampListCreateView.as_view(), name='camp-list-create'),

    # Update an existing camp
    path(
        '<int:pk>/',
        CampUpdateView.as_view(),
        name='camp-update'
    ),

    # Donor registers for a camp
    path(
        '<int:pk>/register/',
        CampRegistrationCreateView.as_view(),
        name='camp-register'
    ),

    # Donor views their registrations
    path(
        'my-registrations/',
        MyCampRegistrationsView.as_view(),
        name='my-camp-registrations'
    ),

    # Donor cancels registration
    path(
        'registrations/<int:pk>/cancel/',
        CampRegistrationCancelView.as_view(),
        name='camp-registration-cancel'
    ),

    # Blood bank views registrations for its camp
    path(
        '<int:pk>/registrations/',
        BankCampRegistrationListView.as_view(),
        name='bank-camp-registrations'
    ),

    # Blood bank marks donor attendance
    path(
        'registrations/<int:pk>/attendance/',
        CampAttendanceUpdateView.as_view(),
        name='camp-attendance'
    ),
    path('<int:pk>/cancel/', CampCancelView.as_view(), name='camp-cancel'),

]