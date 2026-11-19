from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination

from .models import District
from .serializers import DistrictSerializer


class DistrictPagination(PageNumberPagination):
    page_size = 1000


class DistrictListView(generics.ListAPIView):

    queryset = District.objects.all().order_by('state', 'name')
    serializer_class = DistrictSerializer
    permission_classes = [AllowAny]

    pagination_class = None