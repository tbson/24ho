from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.serializers import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderFilter
from apps.address.models import Address
from apps.staff.models import Staff
from .serializers import OrderBaseSr
from apps.address.serializers import AddressBaseSr
from .utils import OrderUtils, ComplaintDecide
from .move_status_utils import MoveStatusUtils
from utils.common_classes.custom_pagination import NoPaginationStatic
from utils.helpers.tools import Tools
from apps.order_item.utils import OrderItemUtils
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res


class OrderViewSet(GenericViewSet):
    _name = 'order'
    serializer_class = OrderBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('uid', 'value')
    filterset_class = OrderFilter

    def list(self, request):
        from apps.staff.models import Staff
        from apps.staff.serializers import StaffSelectSr
        from apps.customer.models import Customer
        from apps.customer.serializers import CustomerSelectSr

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
                    'sale': StaffSelectSr(Staff.objects.getListSale(), many=True).data,
                    'cust_care': StaffSelectSr(Staff.objects.getListCustCare(), many=True).data,
                    'customer': CustomerSelectSr(Customer.objects.all(), many=True).data
                }
            }
        }

        return self.get_paginated_response(result)

    def retrieve(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderBaseSr(order)
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
        from apps.bol.models import Bol
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.purchase_code)
        value = Tools.remove_special_chars(value)
        serializer = OrderUtils.partial_update(obj, 'purchase_code', value)
        data = serializer.data
        Bol.objects.filter(purchase_code=data.get('purchase_code')).update(order=obj)
        return res(data)

    @transaction.atomic
    @action(methods=['put'], detail=True)
    def change_status(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        status = request.data.get('value', obj.status)
        obj = MoveStatusUtils.move(obj, int(status), approver=request.user.staff)
        serializer = OrderBaseSr(obj)
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['put'], detail=True)
    def change_shockproof(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.shockproof)
        serializer = OrderUtils.partial_update(obj, 'shockproof', value)
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['put'], detail=True)
    def change_wooden_box(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.wooden_box)
        serializer = OrderUtils.partial_update(obj, 'wooden_box', value)
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['put'], detail=True)
    def change_count_check(self, request, pk=None):
        obj = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', obj.count_check)
        serializer = OrderUtils.partial_update(obj, 'count_check', value)
        return res(serializer.data)

    @transaction.atomic
    @action(methods=['put'], detail=True)
    def batch_update(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        value = request.data.get('value', 0)
        extra = request.data.get('extra', [])
        ids = extra.get('ids', [])
        field = extra.get('field', '')
        params = {}
        params[field] = value
        OrderItemUtils.batch_update(order, ids, params)
        return res({})

    @transaction.atomic
    @action(methods=['post'], detail=True)
    def discard(self, request, pk=None):
        from apps.order.serializers import OrderBaseSr
        from apps.order.models import Status
        order = get_object_or_404(Order, pk=pk)
        order = MoveStatusUtils.move(order, Status.DISCARD, staff=request.user.staff)
        return res(OrderBaseSr(order).data)

    @transaction.atomic
    @action(methods=['post'], detail=True, permission_classes=[IsAuthenticated])
    def renew_discard(self, request, pk=None):
        from apps.order.serializers import OrderBaseSr
        from apps.order.models import Status
        order = get_object_or_404(Order, pk=pk)
        if hasattr(request.user, 'customer') and order.customer != request.user.customer:
            raise ValidationError("Bạn không thể khởi tạo lại đơn hàng của người khác.")
        order = MoveStatusUtils.move(order, Status.NEW)
        return res(OrderBaseSr(order).data)

    @transaction.atomic
    @action(methods=['put'], detail=False)
    def bulk_approve(self, request):
        from .utils import OrderUtils
        pks = self.request.data.get('ids', [])
        sale = int(self.request.data.get('sale', 0))
        if not sale:
            sale = None
        for pk in pks:
            order = get_object_or_404(Order, pk=pk)
            success, message = OrderUtils.approve(order, request.user.staff, sale)
            if not success:
                raise ValidationError(message)
        return res({'approved': pks})

    @action(methods=['get'], detail=False)
    def get_order_items_for_checking(self, request, uid=''):
        from apps.bol.models import Bol
        from apps.order_item.serializers import OrderItemBaseSr
        from apps.bol.serializers import BolBaseSr
        order_items = OrderUtils.get_items_for_checking(uid)
        order = order_items[0].order
        bols = Bol.objects.filter(order_id=order.pk)

        result = {
            'items': OrderItemBaseSr(order_items, many=True).data,
            'extra': {
                'order': OrderBaseSr(order).data,
                'bols': BolBaseSr(bols, many=True).data
            }
        }

        return NoPaginationStatic.get_paginated_response(result)

    @transaction.atomic
    @action(methods=['post'], detail=False)
    def check(self, request):
        from apps.order.models import Order
        from apps.order.utils import OrderUtils
        uid = request.data.get('uid', None)
        checked_items = request.data.get('checked_items', {})
        potential_bols = request.data.get('potential_bols', '')

        order = get_object_or_404(Order, uid=uid)

        remain = OrderUtils.check(order, checked_items)
        if len(remain.keys()):
            order.pending = True
        order.checked_date = timezone.now()
        order.checker = request.user.staff
        order.potential_bols = potential_bols
        order.save()
        return res(remain)

    @action(methods=['post'], detail=False)
    def complaint_resolve(self, request, pk=None):
        order = get_object_or_404(Order, pk=pk)
        decide = int(request.data.get('decide', ComplaintDecide.AGREE))
        if decide == ComplaintDecide.AGREE:
            OrderUtils.complaint_agree(order)
        elif decide == ComplaintDecide.MONEY_BACK:
            OrderUtils.complaint_money_back(order)
        elif decide == ComplaintDecide.CHANGE:
            OrderUtils.complaint_change(order)
        else:
            raise ValidationError("Lựa chọn giải quyết khiếu nại không hợp lệ.")
        return res({})

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


class OrderViewSetIsAuthenticated(GenericViewSet):
    _name = 'order'
    serializer_class = OrderBaseSr
    permission_classes = (IsAuthenticated, )

    @transaction.atomic
    @action(methods=['post'], detail=True)
    def early_discard(self, request, pk=None):
        from apps.order.serializers import OrderBaseSr
        from apps.order.models import Status
        order = get_object_or_404(Order, pk=pk)
        staff = None
        if hasattr(request.user, 'customer') and order.customer != request.user.customer:
            raise ValidationError("Bạn không thể huỷ đơn hàng của người khác.")
        if hasattr(request.user, 'staff'):
            staff = request.user.staff
        order = MoveStatusUtils.move(order, Status.DISCARD, staff=staff)
        return res(OrderBaseSr(order).data)

    @action(methods=['post'], detail=True)
    def img_to_url(self, request, pk=None):
        file = request.data.get('file')
        path = Tools.write_rile(file, 'order_item')
        return res({'path': path})
