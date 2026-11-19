from django.urls import path
from .views import DistrictListView

urlpatterns = [
    path('districts/', DistrictListView.as_view(), name='district-list'),
]