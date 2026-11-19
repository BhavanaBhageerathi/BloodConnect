"""
URL configuration for project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/accounts/', include('accounts.urls')),
    
    path('api/accounts/token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('api/verification/', include('verification.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/blood-requests/', include('blood_requests.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/donations/', include('donations.urls')),
    path('api/camps/', include('camps.urls')),
    path('api/locations/', include('locations.urls')),
    path('api/admin/', include('admin_panel.urls')),








]





