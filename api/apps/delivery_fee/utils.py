from django.conf import settings
from django.db import models
from apps.area.utils import AreaUtils


class DeliveryFeeUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.delivery_fee.serializers import DeliveryFeeBaseSr
        from .models import DeliveryFeeUnitPriceType

        if index == 0:
            raise Exception('Indext must be start with 1.')

        area = AreaUtils.seeding(1, True)

        def get_data(i: int) -> dict:
            data = {
                'area': area.pk,
                'start': i * 10,
                'stop': i * 10 + 9,
                'vnd_unit_price': int(200000 / i),
                'type': DeliveryFeeUnitPriceType.MASS
            }
            if save is False:
                return data

            instance = DeliveryFeeBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def get_matched_unit_price(value: float, area_id: int, type: int) -> float:
        from .models import DeliveryFee, TYPES, DeliveryFeeUnitPriceType

        if type not in dict(TYPES):
            raise Exception('Invalid type of delivery fee unit price.')

        result = DeliveryFee.objects.filter(area_id=area_id, start__lte=value, stop__gte=value, type=type)
        if result.count():
            return result.first().vnd_unit_price
        if type == DeliveryFeeUnitPriceType.MASS:
            return settings.DEFAULT_DELIVERY_MASS_UNIT_PRICE
        return settings.DEFAULT_DELIVERY_VOLUME_UNIT_PRICE
