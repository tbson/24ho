from schema import Schema
from django.db import models
from rest_framework.serializers import ValidationError
from apps.address.utils import AddressUtils
from apps.delivery_fee.models import DeliveryFeeUnitPriceType
from apps.delivery_fee.utils import DeliveryFeeUtils
from apps.order_item.models import OrderItem
from django.conf import settings
from typing import Dict

error_messages = {
    'BOL_ORDER_NOT_FOUND': 'Vận đơn này chưa được gắn với order nào.',
    'ORDER_MISSING_IN_ORDER_ITEM': 'Một trong những sản phẩm không nằm trong đơn hàng.',
    'ORDER_ITEM_MISSING': 'Số lượng sản phẩm không khớp.',
    'ITEM_ORDER_NOT_FOUND': 'Một trong những sản phẩm không nằm trong đơn hàng.',
    'ORDER_ITEM_NOT_FOUND': 'Vận đơn này không có mặt hàng nào.',
    'CHECKED_QUANTITY_LARGER_THAN_ORIGINAL_QUANTITY': 'Khối lượng kiểm lớn hơn khối lượng thực.',
    'INT_CHECKED_QUANTITY': 'Số lượng kiểm phải là số nguyên >= 0.'
}


class BolUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import BolBaseSr

        if index == 0:
            raise Exception('Indext must be start with 1.')

        address = AddressUtils.seeding(1, True)

        def get_data(i: int) -> dict:

            data = {
                'uid': "UID{}".format(i),
                'address': address.pk
            }
            if save is False:
                return data

            instance = BolBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def get_mass(item: models.QuerySet) -> float:
        return item.mass

    @staticmethod
    def get_mass_convert(item: models.QuerySet) -> float:
        return item.width * item.height * item.length / item.mass_convert_factor

    @staticmethod
    def get_volume(item: models.QuerySet) -> float:
        return item.width * item.height * item.length / 1000000

    @staticmethod
    def cal_delivery_fee_range(item: models.QuerySet) -> dict:
        if not item.address:
            return {
                'MASS': 0,
                'VOLUME': 0
            }
        mass = BolUtils.get_mass(item)
        return {
            'MASS': DeliveryFeeUtils.get_matched_unit_price(
                mass,
                item.address.area_id,
                DeliveryFeeUnitPriceType.MASS
            ),
            'VOLUME': DeliveryFeeUtils.get_matched_unit_price(
                mass,
                item.address.area_id,
                DeliveryFeeUnitPriceType.VOLUME
            )
        }

    @staticmethod
    def cal_delivery_fee_mass_unit_price(item: models.QuerySet) -> dict:
        range_unit_price = BolUtils.cal_delivery_fee_range(item)['MASS']
        customer_unit_price = item.customer.delivery_fee_mass_unit_price if item.customer else 0
        bol_unit_price = item.mass_unit_price

        return {
            'RANGE': range_unit_price,
            'FIXED': bol_unit_price or customer_unit_price or 0
        }

    @staticmethod
    def cal_delivery_fee_volume_unit_price(item: models.QuerySet) -> dict:
        range_unit_price = BolUtils.cal_delivery_fee_range(item)['VOLUME']
        customer_unit_price = item.customer.delivery_fee_volume_unit_price if item.customer else 0
        bol_unit_price = item.volume_unit_price

        return {
            'RANGE': range_unit_price,
            'FIXED': bol_unit_price or customer_unit_price or 0
        }

    @staticmethod
    def cal_delivery_fee(item: models.QuerySet) -> dict:
        from .models import DeliveryFeeType
        mass = BolUtils.get_mass(item)
        mass_convert = BolUtils.get_mass_convert(item)
        volume = BolUtils.get_volume(item)

        mass_unit_price = BolUtils.cal_delivery_fee_mass_unit_price(item)
        volume_unit_price = BolUtils.cal_delivery_fee_volume_unit_price(item)

        mass_range_price = mass * mass_unit_price['RANGE']
        mass_price = mass * mass_unit_price['FIXED']
        mass_convert_price = mass_convert * mass_unit_price['FIXED']
        volume_range_price = volume * volume_unit_price['RANGE']
        volume_price = volume * volume_unit_price['FIXED']

        delivery_fee = max(mass_price, mass_convert_price, mass_range_price, volume_price, volume_range_price)

        if item.delivery_fee_type == DeliveryFeeType.MASS_RANGE:
            delivery_fee = mass_range_price
        if item.delivery_fee_type == DeliveryFeeType.MASS:
            delivery_fee = mass_price
        if item.delivery_fee_type == DeliveryFeeType.MASS_CONVERT:
            delivery_fee = mass_convert_price
        if item.delivery_fee_type == DeliveryFeeType.VOLUME_RANGE:
            delivery_fee = volume_range_price
        if item.delivery_fee_type == DeliveryFeeType.VOLUME:
            delivery_fee = volume_price

        return {
            'mass_range_unit_price': mass_unit_price['RANGE'],
            'volume_range_unit_price': volume_unit_price['RANGE'],
            'delivery_fee': delivery_fee
        }

    @staticmethod
    def cal_insurance_fee(item: models.QuerySet) -> float:
        if not item.order and item.insurance:
            return item.cny_insurance_value * settings.DEFAULT_INSURANCE_FACTOR / 100
        return 0

    @staticmethod
    def cal_shockproof_fee(item: models.QuerySet) -> float:
        if item.shockproof:
            return item.cny_shockproof_fee
        return 0

    @staticmethod
    def cal_wooden_box_fee(item: models.QuerySet) -> float:
        if item.wooden_box:
            return item.cny_wooden_box_fee
        return 0

    @staticmethod
    def get_items_for_checking(uid: str) -> models.QuerySet:
        from .models import Bol

        bol = Bol.objects.filter(uid=uid).first()
        if not bol.order_id:
            raise ValidationError(error_messages['BOL_ORDER_NOT_FOUND'])

        order = bol.order
        result = order.order_items.filter(quantity__gt=0)
        if result.count() == 0:
            raise ValidationError(error_messages['ORDER_ITEM_NOT_FOUND'])

        return result

    @staticmethod
    def checking(order: models.QuerySet, checked_items: Dict[int, int]) -> Dict[int, int]:
        if not Schema({int: lambda n: n >= 0}).is_valid(checked_items):
            raise ValidationError(error_messages['INT_CHECKED_QUANTITY'])

        items = OrderItem.objects.filter(pk__in=checked_items.keys())

        if items.count() != len(checked_items.keys()):
            raise ValidationError(error_messages['ORDER_ITEM_MISSING'])

        if items.filter(order_id=order.pk).count() != items.count():
            raise ValidationError(error_messages['ORDER_MISSING_IN_ORDER_ITEM'])

        remain = {}
        for item in items:
            if item.quantity < checked_items[item.pk]:
                raise ValidationError(error_messages['CHECKED_QUANTITY_LARGER_THAN_ORIGINAL_QUANTITY'])
            if item.quantity > checked_items[item.pk]:
                remain[item.pk] = item.quantity - checked_items[item.pk]
                item.checked_quantity = checked_items[item.pk]
                item.save()

        if len(remain.keys()):
            order.pending = True
            order.save()

        return remain

    @staticmethod
    def partial_update(obj, key, value):
        from .serializers import BolBaseSr
        data = {}
        data[key] = value
        serializer = BolBaseSr(obj, data=data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return serializer
