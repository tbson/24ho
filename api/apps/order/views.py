from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Order
from apps.staff.models import Staff
from .serializers import OrderBaseSr
from apps.staff.serializers import StaffCompactSr
from .utils import OrderUtils
from utils.helpers.tools import Tools
from apps.order_item.utils import OrderItemUtils
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res


class OrderViewSet(GenericViewSet):
    _name = 'order'
    serializer_class = OrderBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('uid', 'value')
    filterset_fields = ('status', )

    def list(self, request):
        queryset = Order.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = OrderBaseSr(queryset, many=True)

        result = {
            'items': serializer.data,
            'extra': {
                'options': {
                    'sale': StaffCompactSr(Staff.objects.filter(is_sale=True), many=True).data,
                    'cust_care': StaffCompactSr(Staff.objects.filter(is_cust_care=True), many=True).data
                }
            }
        }

        return self.get_paginated_response(result)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        serializer = OrderBaseSr(obj)
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['post'], detail=True)
    def add(self, request):
        data, order_items = OrderUtils.prepare_data(request.data)
        order = OrderUtils.validate_create(data)
        OrderItemUtils.validate_bulk_create(order_items, order.id)
        return res(OrderBaseSr(order).data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        serializer = OrderBaseSr(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_sale(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        staff = Tools.obj_from_pk(Staff, request.data.get('value', None))
        serializer = OrderUtils.partial_update(obj, 'sale', staff)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_cust_care(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        staff = Tools.obj_from_pk(Staff, request.data.get('value', None))
        serializer = OrderUtils.partial_update(obj, 'cust_care', staff)
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
