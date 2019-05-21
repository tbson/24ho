from django.db import models
from django.conf import settings


class OrderFeeUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.order_fee.serializers import OrderFeeBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'from_amount': i * 10,
                'to_amount': i * 10 + 9,
                'fee': 20 / i
            }
            if save is False:
                return data

            instance = OrderFeeBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def get_matched_factor(amount: float) -> float:
        from .models import OrderFee

        result = OrderFee.objects.filter(from_amount__lte=amount, to_amount__gte=amount)
        if result.count():
            return result.first().fee
        return settings.DEFAULT_ORDER_FEE_FACTOR
