from typing import Tuple
import uuid
import json
from schema import Schema
from django.utils import timezone
from django.db import models
from django.db.models import Sum, F
from rest_framework.serializers import ValidationError
from apps.address.utils import AddressUtils
from apps.order_fee.utils import OrderFeeUtils
from utils.helpers.tools import Tools
from typing import Dict
from django.conf import settings

error_messages = {
    'BOL_ORDER_NOT_FOUND': 'Vận đơn này chưa được gắn với order nào.',
    'ORDER_WAS_PENDING': 'Đơn hàng của vận đơn này đang trong trạng thái khiếu nại.',
    'ORDER_AFTER_EXPORTING': 'Có ít nhất 1 vận đơn của đơn hàng này đã được xuất.',
    'ORDER_MISSING_IN_ORDER_ITEM': 'Một trong những sản phẩm không nằm trong đơn hàng.',
    'ORDER_ITEM_MISSING': 'Số lượng sản phẩm không khớp.',
    'ITEM_ORDER_NOT_FOUND': 'Một trong những sản phẩm không nằm trong đơn hàng.',
    'ORDER_ITEM_NOT_FOUND': 'Vận đơn này không có mặt hàng nào.',
    'CHECKED_QUANTITY_LARGER_THAN_ORIGINAL_QUANTITY': 'Khối lượng kiểm lớn hơn khối lượng thực.',
    'INT_CHECKED_QUANTITY': 'Số lượng kiểm phải là số nguyên >= 0.'
}


class ComplaintDecide:
    AGREE = 1
    MONEY_BACK = 2
    CHANGE = 3


class QuantityResolve:
    CHECK_EQUAL_ORIGINAL = 1
    ORIGINAL_EQUAL_CHECK = 2


class OrderUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import OrderBaseSr

        address = AddressUtils.seeding(1, True)

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'uid': str(uuid.uuid4()),
                'address': address.id,
                'shop_link': "shop_link{}".format(i),
                'shop_nick': "shop_nick{}".format(i),
                'site': "site{}".format(i),
                'rate': 3400,
                'real_rate': 3300
            }

            if save is False:
                return data

            instance = OrderBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def prepare_data(payload):
        order = json.loads(payload['order'])
        order_items = json.loads(payload['items'])
        if len(order_items) and 'image' in order_items[0]:
            order['thumbnail'] = order_items[0]['image']
        return (order, order_items)

    @staticmethod
    def validate_create(data):
        from .serializers import OrderBaseSr

        order_sr = OrderBaseSr(data=data)
        order_sr.is_valid(raise_exception=True)
        return order_sr.save()

    @staticmethod
    def partial_update(obj, key, value):
        from .serializers import OrderBaseSr
        data = {}
        data[key] = value
        serializer = OrderBaseSr(obj, data=data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return serializer

    @staticmethod
    def sum_cny(order: dict) -> float:
        cny_amount = order.get('cny_amount', 0)

        cny_order_fee = order.get('cny_order_fee', 0)

        cny_inland_delivery_fee = order.get('cny_inland_delivery_fee', 0)

        cny_count_check_fee = order.get('cny_count_check_fee', 0)
        cny_shockproof_fee = order.get('cny_shockproof_fee', 0)
        cny_wooden_box_fee = order.get('cny_wooden_box_fee', 0)
        cny_sub_fee = order.get('cny_sub_fee', 0)

        series = [
            cny_amount,
            cny_order_fee,
            cny_inland_delivery_fee,
            cny_count_check_fee,
            cny_shockproof_fee,
            cny_wooden_box_fee,
            cny_sub_fee
        ]

        return sum(series)

    @staticmethod
    def sum_vnd(order: dict) -> int:
        vnd_delivery_fee = order.get('vnd_delivery_fee', 0)
        vnd_sub_fee = order.get('vnd_sub_fee', 0)

        series = [
            vnd_delivery_fee,
            vnd_sub_fee
        ]

        return sum(series)

    @staticmethod
    def get_vnd_total_discount(order: dict) -> int:
        rate = order['rate']

        vnd_delivery_fee = order['vnd_delivery_fee_discount']
        cny_count_check_fee = order['cny_count_check_fee_discount']
        cny_order_fee = order['cny_order_fee_discount']
        return int(rate * (cny_order_fee + cny_count_check_fee) + vnd_delivery_fee)

    @staticmethod
    def get_vnd_total(order: dict) -> int:
        rate = order['rate']
        cny = OrderUtils.sum_cny(order)
        vnd = OrderUtils.sum_vnd(order)
        vnd_total_discount = OrderUtils.get_vnd_total_discount(order)
        return int(rate * cny + vnd) - vnd_total_discount

    @staticmethod
    def cal_amount(item: models.QuerySet) -> float:
        if item.order_items.count() == 0:
            return 0
        return item.order_items.aggregate(
            amount=Sum(
                F('quantity') * F('unit_price'),
                output_field=models.FloatField()
            )
        )['amount']

    @staticmethod
    def cal_order_fee(item: models.QuerySet) -> float:
        amount = item.cny_amount

        if item.order_fee_factor:
            factor = item.order_fee_factor
        elif item.customer.order_fee_factor:
            factor = item.customer.order_fee_factor
        else:
            factor = OrderFeeUtils.get_matched_factor(amount)

        return factor * amount / 100

    @staticmethod
    def cal_delivery_fee(item: models.QuerySet) -> float:
        from apps.bol.utils import BolUtils
        # sum of bols's delivery fee
        return sum([BolUtils.cal_delivery_fee(bol)['delivery_fee'] for bol in item.order_bols.all()])

    @staticmethod
    def cal_count_check_fee(item: models.QuerySet) -> float:
        from apps.count_check.utils import CountCheckUtils

        result = CountCheckUtils.get_matched_fee(item.order_items.count())
        if item.count_check_fee_input:
            result = item.count_check_fee_input
        return result

    @staticmethod
    def cal_shockproof_fee(item: models.QuerySet) -> float:
        from apps.bol.utils import BolUtils
        # sum of bols's shockproof fee
        return sum([BolUtils.cal_shockproof_fee(bol) for bol in item.order_bols.all()])

    @staticmethod
    def cal_wooden_box_fee(item: models.QuerySet) -> float:
        from apps.bol.utils import BolUtils
        # sum of bols's wooden box fee
        return sum([BolUtils.cal_wooden_box_fee(bol) for bol in item.order_bols.all()])

    @staticmethod
    def cal_sub_fee(item: models.QuerySet) -> float:
        # sum of bols's sub fee
        return sum([bol.cny_sub_fee for bol in item.order_bols.all()])

    @staticmethod
    def cal_statistics(item: models.QuerySet) -> dict:
        order_items = item.order_items.all()
        bols = item.order_bols.all()

        links = len(list(dict.fromkeys([order_item.url for order_item in order_items])))
        quantity = sum([order_item.quantity for order_item in order_items])
        packages = sum([bol.packages for bol in bols])

        return {
            "links": links,
            "quantity": quantity,
            "packages": packages
        }

    @staticmethod
    def cal_all(item: models.QuerySet) -> dict:
        result = {}
        '''
        Frezee after confirm
        '''
        result['cny_amount'] = OrderUtils.cal_amount(item)
        result['cny_order_fee'] = OrderUtils.cal_order_fee(item)
        # item.cny_inland_delivery_fee

        '''
        Frezee after export
        '''
        result['vnd_delivery_fee'] = OrderUtils.cal_delivery_fee(item)
        result['cny_count_check_fee'] = OrderUtils.cal_count_check_fee(item)
        result['cny_shockproof_fee'] = OrderUtils.cal_shockproof_fee(item)
        result['cny_wooden_box_fee'] = OrderUtils.cal_wooden_box_fee(item)
        result['cny_sub_fee'] = OrderUtils.cal_sub_fee(item)

        return result

    @staticmethod
    def get_next_uid(address: models.QuerySet) -> str:
        last_uid, address_code, date = OrderUtils.prepare_next_uid(address)
        date_part = Tools.get_str_day_month(date)
        index = Tools.get_next_uid_index(last_uid)
        return "{}{}{}".format(address_code, date_part, index)

    @staticmethod
    def prepare_next_uid(address: models.QuerySet) -> Tuple[str, str, timezone.datetime]:
        from .models import Order
        last_item = Order.objects.filter(address=address).order_by('-id').first()
        last_uid = last_item.uid if last_item is not None else ''
        date = timezone.now()
        return (last_uid, address.uid, date)

    @staticmethod
    def get_items_for_checking(uid: str) -> models.QuerySet:
        from apps.bol.models import Bol
        from .models import Status

        bol = Bol.objects.filter(uid=uid).first()
        if not bol.order_id:
            raise ValidationError(error_messages['BOL_ORDER_NOT_FOUND'])

        order = bol.order
        if order.pending:
            raise ValidationError(error_messages['ORDER_WAS_PENDING'])

        if order.status >= Status.EXPORTED:
            raise ValidationError(error_messages['ORDER_AFTER_EXPORTING'])

        result = order.order_items.filter(quantity__gt=0)
        if result.count() == 0:
            raise ValidationError(error_messages['ORDER_ITEM_NOT_FOUND'])

        return result

    @staticmethod
    def get_remain(order: models.QuerySet) -> Dict[str, int]:
        remain = {}
        for item in order.order_items.all():
            if (item.quantity > item.checked_quantity):
                remain[str(item.pk)] = item.quantity - item.checked_quantity
        return remain

    @staticmethod
    def check(order: models.QuerySet, checked_items: Dict[str, int]) -> Dict[str, int]:
        from apps.order_item.models import OrderItem
        if len(checked_items.keys()):
            if not Schema({str: lambda n: n >= 0}).is_valid(checked_items):
                raise ValidationError(error_messages['INT_CHECKED_QUANTITY'])

            items = OrderItem.objects.filter(pk__in=checked_items.keys())

            if items.count() != len(checked_items.keys()):
                raise ValidationError(error_messages['ORDER_ITEM_MISSING'])

            if items.filter(order_id=order.pk).count() != items.count():
                raise ValidationError(error_messages['ORDER_MISSING_IN_ORDER_ITEM'])

            for item in items:
                checked_value = checked_items[str(item.pk)]
                if item.quantity < checked_value:
                    raise ValidationError(error_messages['CHECKED_QUANTITY_LARGER_THAN_ORIGINAL_QUANTITY'])
                if item.quantity > checked_value:
                    item.checked_quantity = checked_value
                    item.save()

        remain = OrderUtils.get_remain(order)
        if len(remain.keys()):
            OrderUtils.pending(order)

        return remain

    @staticmethod
    def clone_order(order: models.QuerySet, remain: Dict[str, int], potential_bols: str) -> models.QuerySet:
        from .serializers import OrderBaseSr
        from apps.order_item.serializers import OrderItemBaseSr
        from apps.bol.models import Bol
        pks = [int(i) for i in remain.keys()]
        order_items = order.order_items.filter(pk__in=pks)
        order_data = OrderBaseSr(order).data
        del order_data['id']
        order_data['uid'] = OrderUtils.get_next_uid(order.address)
        order_data['purchase_code'] = order_data['purchase_code'] + '-kn'

        new_order = OrderBaseSr(data=order_data)
        new_order.is_valid(raise_exception=True)
        new_order = new_order.save()

        for bol in Bol.objects.filter(uid__in=potential_bols.split(',')):
            bol.purchase_code = order_data['purchase_code']
            bol.save()

        for item in order_items:
            data = OrderItemBaseSr(item).data
            data['order'] = new_order.pk
            data['quantity'] = remain[str(item.pk)]
            data['checked_quantity'] = remain[str(item.pk)]
            instance = OrderItemBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance.save()

        return new_order

    @staticmethod
    def pending(order: models.QuerySet) -> models.QuerySet:
        order.pending = True
        order.save()
        return order

    @staticmethod
    def unpending(order: models.QuerySet) -> str:
        potential_bols = order.potential_bols
        order.pending = False
        order.save()
        return potential_bols

    @staticmethod
    def quantity_resolve(order: models.QuerySet, resolve_type: int) -> models.QuerySet:
        if resolve_type == QuantityResolve.CHECK_EQUAL_ORIGINAL:
            for item in order.order_items.all():
                item.checked_quantity = item.quantity
                item.save()
        if resolve_type == QuantityResolve.ORIGINAL_EQUAL_CHECK:
            for item in order.order_items.all():
                item.quantity = item.checked_quantity
                item.save()
        return order

    @staticmethod
    def complaint_agree(order: models.QuerySet) -> models.QuerySet:
        OrderUtils.unpending(order)
        OrderUtils.quantity_resolve(order, QuantityResolve.CHECK_EQUAL_ORIGINAL)
        return order

    @staticmethod
    def complaint_money_back(order: models.QuerySet) -> models.QuerySet:
        OrderUtils.unpending(order)
        OrderUtils.quantity_resolve(order, QuantityResolve.ORIGINAL_EQUAL_CHECK)
        return order

    @staticmethod
    def complaint_change(order: models.QuerySet) -> models.QuerySet:
        remain = OrderUtils.get_remain(order)
        potential_bols = OrderUtils.unpending(order)
        OrderUtils.quantity_resolve(order, QuantityResolve.ORIGINAL_EQUAL_CHECK)
        if (len(remain.keys())):
            OrderUtils.clone_order(order, remain, potential_bols)

        return order

    @staticmethod
    def get_deposit_amount(order: models.QuerySet) -> int:
        from .serializers import OrderBaseSr
        return int(OrderUtils.get_vnd_total(OrderBaseSr(order).data) * settings.DEPOSIT_FACTOR / 100)

    @staticmethod
    def can_deposit(order: models.QuerySet) -> bool:
        from apps.transaction.utils import TransactionUtils
        balance = TransactionUtils.get_customer_balance(order.customer.pk)
        if balance >= OrderUtils.get_deposit_amount(order):
            return True
        return False

    @staticmethod
    def check_paid_status(order: models.QuerySet):
        from .models import Status
        from .move_status_utils import MoveStatusUtils
        if not order.order_bols.count() and order.status > Status.PAID:
            try:
                MoveStatusUtils.move(order, Status.PAID)
            except ValidationError:
                pass

    @staticmethod
    def check_dispatched_status(order: models.QuerySet):
        from .models import Status
        from .move_status_utils import MoveStatusUtils
        if order.order_bols.count():
            try:
                MoveStatusUtils.move(order, Status.DISPATCHED)
            except ValidationError:
                pass

    @staticmethod
    def check_cn_status(order: models.QuerySet):
        from .models import Status
        from .move_status_utils import MoveStatusUtils
        number_of_cn_bols = order.order_bols.filter(cn_date__isnull=False).count()
        if number_of_cn_bols:
            try:
                MoveStatusUtils.move(order, Status.CN_STORE)
            except ValidationError:
                pass

    @staticmethod
    def check_vn_status(order: models.QuerySet):
        from .models import Status
        from .move_status_utils import MoveStatusUtils
        number_of_bols = order.order_bols.count()
        number_of_vn_bols = order.order_bols.filter(vn_date__isnull=False).count()
        if number_of_bols and number_of_vn_bols == number_of_bols:
            try:
                MoveStatusUtils.move(order, Status.VN_STORE)
            except ValidationError:
                pass

    @staticmethod
    def check_exported_status(order: models.QuerySet):
        from .models import Status
        from .move_status_utils import MoveStatusUtils
        number_of_bols = order.order_bols.count()
        number_of_export_bols = order.order_bols.filter(exported_date__isnull=False).count()
        if number_of_bols and number_of_export_bols == number_of_bols:
            try:
                MoveStatusUtils.move(order, Status.EXPORTED)
            except ValidationError:
                pass

    @staticmethod
    def check_done_status(order: models.QuerySet):
        from .models import Status
        from .move_status_utils import MoveStatusUtils
        number_of_bols = order.order_bols.count()
        number_of_export_bols = order.order_bols.filter(exported_date__isnull=False).count()

        if number_of_bols and number_of_export_bols == number_of_bols:
            last_exported_bol = order.order_bols.all().order_by('-exported_date').first()
            if last_exported_bol and last_exported_bol.exported_date:
                delta = timezone.now() - last_exported_bol.exported_date
                if delta.days > settings.COMPLAINT_DAYS:
                    try:
                        MoveStatusUtils.move(order, Status.DONE)
                    except ValidationError:
                        pass
