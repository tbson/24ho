import json
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Order
from .serializers import OrderBaseSr
from apps.order_item.serializers import OrderItemBaseSr
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res


class OrderViewSet(GenericViewSet):
    _name = 'order'
    serializer_class = OrderBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('uid', 'value')

    def list(self, request):
        queryset = Order.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = OrderBaseSr(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        serializer = OrderBaseSr(obj)
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['post'], detail=True)
    def add(self, request):
        payload = request.data
        order = json.loads(payload['order'])
        order_items = json.loads(payload['items'])
        if len(order_items) and 'image' in order_items[0]:
            order['thumbnail'] = order_items[0]['image']

        order_sr = OrderBaseSr(data=order)
        order_sr.is_valid(raise_exception=True)
        order = order_sr.save()

        for item in order_items:
            item['order'] = order.id
            order_item_sr = OrderItemBaseSr(data=item)
            order_item_sr.is_valid(raise_exception=True)
            order_item_sr.save()

        return res(order_sr.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        serializer = OrderBaseSr(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @transaction.atomic
    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pks = self.request.query_params.get('ids', '')
        pks = [int(pks)] if pks.isdigit() else map(lambda x: int(x), pks.split(','))
        for pk in pks:
            obj = get_object_or_404(Order, pk=pk)
            obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
