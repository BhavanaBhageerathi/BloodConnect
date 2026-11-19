from django.urls import path
from .views import (
    ApprovedBloodBanksView,
    LoginView,
    MyProfileView,
    RegisterView,
    LogoutView,
    AdminBloodBankListView
    

)
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MyProfileView.as_view(), name='my_profile'),
    path('approved-blood-banks/',ApprovedBloodBanksView.as_view(),name='approved_blood_banks'),
    path('admin/blood-banks/',AdminBloodBankListView.as_view(),name='admin_blood_bank_list'),
]   

