from django.db import models
from apps.address.utils import AddressUtils
from apps.delivery_fee.models import DeliveryFeeUnitPriceType
from apps.delivery_fee.utils import DeliveryFeeUtils
from django.conf import settings


class BolUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import BolBaseSr

        if index == 0:
            raise Exception('Indext must be start with 1.')

        address = AddressUtils.seeding(1, True)

        def get_data(i: int) -> dict:

            data = {
                'uid': "uid{}".format(i),
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
        return item.input_mass

    @staticmethod
    def get_mass_convert(item: models.QuerySet) -> float:
        return item.width * item.height * item.length / item.mass_convert_factor

    @staticmethod
    def get_volume(item: models.QuerySet) -> float:
        return item.width * item.height * item.length / 1000000

    @staticmethod
    def cal_delivery_fee_range(item: models.QuerySet) -> dict:
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
        customer_unit_price = item.customer.delivery_fee_mass_unit_price
        bol_unit_price = item.mass_unit_price

        return {
            'RANGE': range_unit_price,
            'FIXED': bol_unit_price or customer_unit_price or 0
        }

    @staticmethod
    def cal_delivery_fee_volume_unit_price(item: models.QuerySet) -> dict:
        range_unit_price = BolUtils.cal_delivery_fee_range(item)['VOLUME']
        customer_unit_price = item.customer.delivery_fee_volume_unit_price
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
        if not item.order and item.insurance_register:
            return item.insurance_value * settings.DEFAULT_INSURANCE_FACTOR / 100
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