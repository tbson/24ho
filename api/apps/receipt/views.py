from django.db import transaction
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Receipt
from .serializers import (
    ReceiptBaseSr,
)
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res
from .utils import ReceiptUtils


class ReceiptViewSet(GenericViewSet):
    _name = 'receipt'
    serializer_class = ReceiptBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('uid', 'value')

    def list(self, request):
        queryset = Receipt.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = ReceiptBaseSr(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Receipt, pk=pk)
        serializer = ReceiptBaseSr(obj)
        return res(serializer.data)

    def retrieve_to_print(self, request, pk=None):
        receipt = get_object_or_404(Receipt, pk=pk)
        result = ReceiptUtils.retrieve_to_print(receipt)
        return res(result)

    @transaction.atomic
    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = ReceiptBaseSr(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Receipt, pk=pk)
        serializer = ReceiptBaseSr(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(Receipt, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @transaction.atomic
    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Receipt.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
