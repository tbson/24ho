from django.utils import timezone
from django.db import models
from django.conf import settings


class RateUtils:
    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import RateBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')
        base_rate = 3432

        def get_data(i: int) -> dict:
            data = {
                'rate': base_rate + i + 1,
                'sub_delta': i + 2,
                'order_delta': i + 3
            }
            if save is False:
                return data

            instance = RateBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def duplicate(model):
        try:
            last_item = model.objects.latest('pk')
        except model.DoesNotExist:
            return None
        if last_item.created_at > timezone.now() - timezone.timedelta(days=1):
            return None
        last_item.pk = None
        last_item.created_at = timezone.now()
        last_item.updated_at = timezone.now()
        last_item.save()
        return last_item

    @staticmethod
    def get_latest_rate() -> dict:
        from .serializers import RateBaseSr
        from .models import Rate
        from apps.variable.models import Variable

        value = settings.DEFAULT_RATE
        real_value = settings.DEFAULT_REAL_RATE
        try:
            item = RateBaseSr(Rate.objects.latest('pk')).data
            value = item['order_rate']
            real_value = item['rate']
        except Rate.DoesNotExist:
            try:
                value = Variable.objects.get(uid='rate').value
            except Variable.DoesNotExist:
                pass

        return {'value': int(value), 'real_value': int(real_value)}
