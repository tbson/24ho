from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Address
from apps.area.models import Area
from .serializers import (
    AddressBaseSr,
)
from apps.area.serializers import AreaBaseSr
from utils.common_classes.custom_permission import CustomPermission
from utils.common_classes.custom_pagination import NoPagination
from utils.helpers.res_tools import res


class AddressViewSet(GenericViewSet):
    _name = 'address'
    serializer_class = AddressBaseSr
    permission_classes = (CustomPermission, )
    pagination_class = NoPagination
    search_fields = ('uid', 'title')

    def list(self, request):
        if hasattr(self.request.user, 'customer'):
            queryset = Address.objects.filter(customer=self.request.user.customer.pk)
        else:
            queryset = Address.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = AddressBaseSr(queryset, many=True)

        result = {
            'items': serializer.data,
            'extra': {
                'list_area': AreaBaseSr(Area.objects.all(), many=True).data
            }
        }
        return self.get_paginated_response(result)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Address, pk=pk)
        serializer = AddressBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        if 'customer' not in request.data:
            request.data['customer'] = self.request.user.customer.pk
        serializer = AddressBaseSr(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Address, pk=pk)
        serializer = AddressBaseSr(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(Address, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Address.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
