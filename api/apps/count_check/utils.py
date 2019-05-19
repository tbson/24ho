from django.db import models
from django.conf import settings


class CountCheckUtils:
    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.count_check.serializers import CountCheckBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'from_items': i * 10,
                'to_items': i * 10 + 9,
                'fee': 20 + i
            }
            if save is False:
                return data

            instance = CountCheckBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def get_matched_fee(items: int) -> float:
        from .models import CountCheck

        result = CountCheck.objects.filter(from_items__lte=items, to_items__gte=items)
        if result.count():
            return result.first().fee
        return settings.DEFAULT_COUNT_CHECK_PRICE
