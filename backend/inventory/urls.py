from django.urls import path
from .views import BloodAllocationIssueView, BloodBankAllocationListView, BloodBankInventoryListView, BloodInventorySummaryView, BloodStockThresholdListView, BloodStockThresholdManagementView, BloodStockThresholdUpdateView, ManualBloodUnitCreateView

urlpatterns = [
    path('bank/units/', BloodBankInventoryListView.as_view(), name='bank-inventory'),
    path('bank/inventory/summary/',BloodInventorySummaryView.as_view(),name='inventory-summary'),
    path('bank/inventory/thresholds/',BloodStockThresholdListView.as_view(),name='blood-stock-thresholds'),
    path('bank/inventory/manage-thresholds/',BloodStockThresholdManagementView.as_view(),name='manage-blood-stock-thresholds'),
    path('bank/inventory/thresholds/<int:pk>/',BloodStockThresholdUpdateView.as_view(),name='update-blood-stock-threshold'),
    path('bank/allocations/',BloodBankAllocationListView.as_view(),name='bank-allocations'),
    path('bank/allocations/<int:pk>/issue/',BloodAllocationIssueView.as_view(),name='issue-blood-allocation'),
    path('bank/add-blood/',ManualBloodUnitCreateView.as_view(),name='bank-add-blood'),

]