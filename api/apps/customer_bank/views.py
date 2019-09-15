from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import CustomerBank
from .serializers import (
    CustomerBankBaseSr,
)
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res


class CustomerBankViewSet(GenericViewSet):
    _name = 'customer_bank'
    serializer_class = CustomerBankBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('bank_name', 'account_name', 'account_number')

    def list(self, request):
        if hasattr(self.request.user, 'customer'):
            queryset = CustomerBank.objects.filter(customer=self.request.user.customer.pk)
        else:
            queryset = CustomerBank.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = CustomerBankBaseSr(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(CustomerBank, pk=pk)
        serializer = CustomerBankBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        if 'customer' not in request.data:
            request.data['customer'] = self.request.user.customer.pk
        serializer = CustomerBankBaseSr(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(CustomerBank, pk=pk)
        serializer = CustomerBankBaseSr(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(CustomerBank, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = CustomerBank.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
