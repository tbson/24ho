from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Order, Status
from apps.staff.models import Staff
from apps.address.models import Address
from .serializers import OrderBaseSr
from apps.staff.serializers import StaffCompactSr
from apps.address.serializers import AddressBaseSr
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
        if hasattr(request.user, 'customer'):
            queryset = queryset.filter(customer=request.user.customer)
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
        data = serializer.data
        data['options'] = {
            'addresses': AddressBaseSr(Address.objects.all(), many=True).data
        }
        return res(data)

    @transaction.atomic
    @action(methods=['post'], detail=True)
    def add(self, request):
        data, order_items = OrderUtils.prepare_data(request.data)
        order = OrderUtils.validate_create(data)
        OrderItemUtils.validate_bulk_create(order_items, order.id)
        return res(OrderBaseSr(order).data)

    @action(methods=['put'], detail=True)
    def change_sale(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        blank, staff = Tools.obj_from_pk(Staff, request.data.get('value', None))
        if not blank and not staff:
            # Staff not exist -> do nothing
            serializer = OrderBaseSr(obj)
        else:
            serializer = OrderUtils.partial_update(obj, 'sale', staff.pk)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_cust_care(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        blank, staff = Tools.obj_from_pk(Staff, request.data.get('value', None))
        if not blank and not staff:
            # Staff not exist -> do nothing
            serializer = OrderBaseSr(obj)
        else:
            serializer = OrderUtils.partial_update(obj, 'cust_care', staff.pk)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_rate(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.rate)
        serializer = OrderUtils.partial_update(obj, 'rate', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_address(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        blank, address = Tools.obj_from_pk(Address, request.data.get('value', None))
        if not blank and not address:
            # Address not exist -> do nothing
            serializer = OrderBaseSr(obj)
        else:
            serializer = OrderUtils.partial_update(obj, 'address', address.pk)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_count_check_fee_input(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.count_check_fee_input)
        serializer = OrderUtils.partial_update(obj, 'count_check_fee_input', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_cny_inland_delivery_fee(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.cny_inland_delivery_fee)
        serializer = OrderUtils.partial_update(obj, 'cny_inland_delivery_fee', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_order_fee_factor(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.order_fee_factor)
        serializer = OrderUtils.partial_update(obj, 'order_fee_factor', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_purchase_code(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.purchase_code)
        serializer = OrderUtils.partial_update(obj, 'purchase_code', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_status(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.status)
        serializer = OrderUtils.partial_update(obj, 'status', value)
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['put'], detail=False)
    def bulk_approve(self, request):
        pks = self.request.data.get('ids', [])
        for pk in pks:
            obj = get_object_or_404(Order, pk=pk)
            if obj.status == Status.NEW:
                obj.status = Status.APPROVED
                obj.save()
        return res({'approved': pks})

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
