from typing import Tuple
import uuid
import json
import re
from django.utils import timezone
from django.db import models
from django.db.models import Sum, F
from rest_framework.serializers import ValidationError
from apps.address.utils import AddressUtils
from apps.order_fee.utils import OrderFeeUtils
from .models import Status, STATUS_CHOICES

MONTH_LETTERS = {
    '01': 'A',
    '02': 'B',
    '03': 'C',
    '04': 'D',
    '05': 'E',
    '06': 'F',
    '07': 'G',
    '08': 'H',
    '09': 'I',
    '10': 'J',
    '11': 'K',
    '12': 'L'
}


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
        date_part = OrderUtils.get_str_day_month(date)
        order_part = OrderUtils.get_next_uid_order(last_uid)
        return "{}{}{}".format(address_code, date_part, order_part)

    @staticmethod
    def prepare_next_uid(address: models.QuerySet) -> Tuple[str, str, timezone.datetime]:
        from .models import Order
        last_item = Order.objects.filter(address=address).order_by('-id').first()
        last_uid = last_item.uid if last_item is not None else ''
        date = timezone.now()
        return (last_uid, address.uid, date)

    @staticmethod
    def get_str_day_month(date: timezone.datetime = timezone.now()) -> str:
        dd = date.strftime("%d")
        m = MONTH_LETTERS[date.strftime("%m")]
        return "{}{}".format(dd, m)

    @staticmethod
    def get_next_uid_order(uid: str) -> int:
        return int(re.split('[A-L]', uid)[-1]) + 1 if uid else 1


class PushOrderStatusUtils:
    @staticmethod
    def error_message(status: Status):
        raise ValidationError("Đơn hàng chỉ có thể chuyển đi từ trạng thái {}.".format(
            dict(STATUS_CHOICES).get(status, 'không xác định')))

    @staticmethod
    def move(item: models.QuerySet, status: Status):
        if status == Status.APPROVED:
            PushOrderStatusUtils._approved(item)
        elif status == Status.DEBT:
            PushOrderStatusUtils._debt(item)
        elif status == Status.PAID:
            PushOrderStatusUtils._paid(item)
        elif status == Status.DISPATCHED:
            PushOrderStatusUtils._dispatched(item)
        elif status == Status.CN_STORE:
            PushOrderStatusUtils._cn_store(item)
        elif status == Status.VN_STORE:
            PushOrderStatusUtils._vn_store(item)
        elif status == Status.EXPORTED:
            PushOrderStatusUtils._exported(item)
        elif status == Status.DONE:
            PushOrderStatusUtils._done(item)
        elif status == Status.DISCARD:
            PushOrderStatusUtils._discard(item)
        else:
            raise Exception('Invalid status')

    @staticmethod
    def _approved(item: models.QuerySet):
        new_status = Status.APPROVED
        old_status = Status.NEW

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _debt(item: models.QuerySet):
        new_status = Status.DEBT
        old_status = Status.APPROVED

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _paid(item: models.QuerySet):
        new_status = Status.PAID
        old_status = Status.DEBT

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _dispatched(item: models.QuerySet):
        new_status = Status.DISPATCHED
        old_status = Status.PAID

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _cn_store(item: models.QuerySet):
        new_status = Status.CN_STORE
        old_status = Status.DISPATCHED

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _vn_store(item: models.QuerySet):
        new_status = Status.VN_STORE
        old_status = Status.CN_STORE

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _exported(item: models.QuerySet):
        new_status = Status.EXPORTED
        old_status = Status.VN_STORE

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _done(item: models.QuerySet):
        new_status = Status.DONE
        old_status = Status.EXPORTED

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _discard(item: models.QuerySet):
        new_status = Status.DISCARD
        old_status = Status.DONE

        if item.status != old_status:
            PushOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()


class PullOrderStatusUtils:
    @staticmethod
    def error_message(status: Status):
        raise ValidationError("Đơn hàng chỉ có thể chuyển về từ trạng thái {}.".format(
            dict(STATUS_CHOICES).get(status, 'không xác định')))

    @staticmethod
    def move(item: models.QuerySet, status: Status):
        if status == Status.NEW:
            PullOrderStatusUtils._new(item)
        elif status == Status.APPROVED:
            PullOrderStatusUtils._approved(item)
        elif status == Status.DEBT:
            PullOrderStatusUtils._debt(item)
        elif status == Status.PAID:
            PullOrderStatusUtils._paid(item)
        elif status == Status.DISPATCHED:
            PullOrderStatusUtils._dispatched(item)
        elif status == Status.CN_STORE:
            PullOrderStatusUtils._cn_store(item)
        elif status == Status.VN_STORE:
            PullOrderStatusUtils._vn_store(item)
        elif status == Status.EXPORTED:
            PullOrderStatusUtils._exported(item)
        elif status == Status.DONE:
            PullOrderStatusUtils._done(item)
        else:
            raise Exception('Invalid status')

    @staticmethod
    def _new(item: models.QuerySet):
        new_status = Status.NEW
        old_status = Status.APPROVED

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _approved(item: models.QuerySet):
        new_status = Status.APPROVED
        old_status = Status.DEBT

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _debt(item: models.QuerySet):
        new_status = Status.DEBT
        old_status = Status.PAID

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _paid(item: models.QuerySet):
        new_status = Status.PAID
        old_status = Status.DISPATCHED

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _dispatched(item: models.QuerySet):
        new_status = Status.DISPATCHED
        old_status = Status.CN_STORE

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _cn_store(item: models.QuerySet):
        new_status = Status.CN_STORE
        old_status = Status.VN_STORE

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _vn_store(item: models.QuerySet):
        new_status = Status.VN_STORE
        old_status = Status.EXPORTED

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _exported(item: models.QuerySet):
        new_status = Status.EXPORTED
        old_status = Status.DONE

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()

    @staticmethod
    def _done(item: models.QuerySet):
        new_status = Status.DONE
        old_status = Status.DISCARD

        if item.status != old_status:
            PullOrderStatusUtils.error_message(old_status)

        item.status = new_status
        item.save()
