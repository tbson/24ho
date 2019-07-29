from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Transaction
from .serializers import (
    TransactionBaseSr,
)
from apps.customer.utils import CustomerUtils
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res
from utils.helpers.tools import Tools
from .utils import TransactionUtils


class TransactionViewSet(GenericViewSet):
    _name = 'transaction'
    serializer_class = TransactionBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('uid', 'staff_username', 'customer_username')

    def list(self, request):
        queryset = Transaction.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = TransactionBaseSr(queryset, many=True)

        result = {
            'items': serializer.data,
            'extra': {
                'list_customer': []
            }
        }
        is_fetch_customers = Tools.string_to_bool(request.query_params.get('customers', 'False'))
        if is_fetch_customers:
            result['extra']['list_customer'] = CustomerUtils.get_list_for_select()
        return self.get_paginated_response(result)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Transaction, pk=pk)
        serializer = TransactionBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = TransactionBaseSr(data=TransactionUtils.update_staff(request.data, request.user))
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Transaction, pk=pk)
        serializer = TransactionBaseSr(obj, data=TransactionUtils.update_staff(request.data, request.user))
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(Transaction, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Transaction.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
