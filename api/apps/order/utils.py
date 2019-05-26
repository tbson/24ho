import json
from django.db import models
from django.db.models import Sum, F
from apps.address.utils import AddressUtils
from apps.order_fee.utils import OrderFeeUtils


class OrderUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import OrderBaseSr

        address = AddressUtils.seeding(1, True)

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
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

        series = [
            cny_amount,
            cny_order_fee,
            cny_inland_delivery_fee,
            cny_count_check_fee,  # VND
            cny_shockproof_fee,  # CNY
            cny_wooden_box_fee,  # CNY
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
        return sum([BolUtils.cal_delivery_fee(bol) for bol in item.order_bols.all()])

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
