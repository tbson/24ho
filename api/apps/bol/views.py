import datetime
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.serializers import ValidationError
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from utils.common_classes.custom_pagination import NoPaginationStatic
from .models import Bol, BolDate, BolFilter
from apps.bag.models import Bag
from .utils import BolUtils
from apps.order_item.serializers import OrderItemBaseSr
from apps.order.serializers import OrderBaseSr
from .serializers import (
    BolBaseSr, BolDateSr
)
from apps.bag.serializers import BagListSr
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res


class BolPermission(CustomPermission):
    def has_object_permission(self, request, view, obj):
        is_allow = True
        user = request.user
        is_customer = user.groups.filter(name='Customer').first()
        if is_customer is not None and obj.customer.pk != user.customer.pk:
            is_allow = False
        return is_allow


class BolViewSet(GenericViewSet):
    _name = 'bol'
    serializer_class = BolBaseSr
    permission_classes = (BolPermission, )
    search_fields = ('uid', 'cn_date', 'vn_date', 'bol_date_id')
    filterset_class = BolFilter

    def get_object(self, pk):
        obj = get_object_or_404(Bol, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def list(self, request):
        queryset = Bol.objects.all()
        if hasattr(request.user, 'customer'):
            queryset = queryset.filter(customer=request.user.customer)
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = BolBaseSr(queryset, many=True)

        today = timezone.now()
        last_30_day = today - datetime.timedelta(days=30)

        bags = Bag.objects.filter(created_at__lte=today, created_at__gt=last_30_day)

        result = {
            'items': serializer.data,
            'extra': {
                'bags': BagListSr(bags, many=True).data
            }
        }

        return self.get_paginated_response(result)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Bol, pk=pk)
        serializer = BolBaseSr(obj)
        return res(serializer.data)

    def retrieve_uid(self, request, uid=''):
        uid = uid.strip().upper()
        obj = get_object_or_404(Bol, uid=uid)
        serializer = BolBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        data = request.data
        serializer = BolBaseSr(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = self.get_object(pk)
        serializer = BolBaseSr(obj, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['get'], detail=False)
    def get_order_items_for_checking(self, request, uid=''):
        order_items = BolUtils.get_items_for_checking(uid)
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

    def change_bag(self, request, pk=None):
        obj = get_object_or_404(Bol, pk=pk)
        value = request.data.get('value', obj.purchase_code)
        if not value:
            raise ValidationError("Bao hàng không được để rỗng.")
        serializer = BolUtils.partial_update(obj, 'bag', value)
        return res(serializer.data)

    @action(methods=['get'], detail=False)
    def get_date(self, request, pk=None):
        queryset = BolDate.objects.all()
        queryset = self.paginate_queryset(queryset)
        serializer = BolDateSr(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = self.get_object(pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pks = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        for pk in pks:
            obj = self.get_object(pk)
            obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
