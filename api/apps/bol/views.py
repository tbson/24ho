import datetime
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.serializers import ValidationError
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Bol, BolDate, BolFilter
from apps.bag.models import Bag
from .utils import BolUtils
from .serializers import (
    BolBaseSr, BolDateSr
)
from apps.bag.serializers import BagListSr
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res
from utils.helpers.tools import Tools
from utils.common_classes.custom_pagination import NoPaginationStatic


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
    search_fields = ('uid', 'cn_date', 'vn_date', )
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

    def ready_to_export_list(self, request):
        queryset = Bol.objects.filter(address__isnull=False, cn_date__isnull=False, exported_date__isnull=True)
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = BolBaseSr(queryset, many=True)

        return NoPaginationStatic.get_paginated_response(serializer.data)

    def export_check(self, request):
        ids = [int(pk) for pk in self.request.query_params.get('ids', '').split(',')]
        bols = Bol.objects.filter(pk__in=ids)

        status = BolUtils.export_check(bols, ids)
        if status:
            raise ValidationError(status)

        return res({'ok': True})

    def export(self, request):
        from apps.receipt.models import Receipt, Type
        from apps.rate.utils import RateUtils
        ids = [int(pk) for pk in self.request.query_params.get('ids', '').split(',')]
        vnd_sub_fee = int(self.request.query_params.get('vnd_sub_fee', 0))
        note = self.request.query_params.get('note', '')
        print([ids, vnd_sub_fee, note])
        bols = Bol.objects.filter(pk__in=ids)

        status = BolUtils.export_check(bols, ids)
        if status:
            raise ValidationError(status)
        '''
        vnd_sub_fee = 0
        vnd_total = 0
        type = Type.ORDER
        if bols.filter(order__isnull=True).count() == bols.count():
            type = Type.TRANSPORT
            latest_rate = RateUtils.get_latest_rate()
            for bol in bols:
                bol.rate = latest_rate['value']
                bol.real_rate = latest_rate['real_value']
                bol.save()
                vnd_sub_fee = vnd_sub_fee + int(bol.cny_sub_fee * bol.rate)
                vnd_total = BolUtils.cal_delivery_fee(bol)
        '''

        return res({'ok': True})

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
        data = Tools.upper_key(request.data, 'uid')
        serializer = BolBaseSr(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = self.get_object(pk)
        data = Tools.upper_key(request.data, 'uid')
        serializer = BolBaseSr(obj, data=data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def match_vn(self, request):
        uid = request.data.get('bol_uid', '').strip().upper()
        bag_uid = request.data.get('bag_uid', '').strip().upper()
        obj = get_object_or_404(Bol, uid=uid, bag__uid=bag_uid)
        if not obj.vn_date:
            obj.vn_date = timezone.now()
            obj.save()
        return res(BolBaseSr(obj).data)

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
