from django.db import models
from django.conf import settings


class OrderFeeManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
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

    def get_matched_factor(self, amount: float) -> float:
        result = self.filter(from_amount__lte=amount, to_amount__gte=amount)
        if result.count():
            return result.first().fee
        return settings.DEFAULT_ORDER_FEE_FACTOR

# Create your models here.


class OrderFee(models.Model):
    from_amount = models.IntegerField()
    to_amount = models.IntegerField()
    fee = models.FloatField()

    objects = OrderFeeManager()

    def __str__(self):
        return '{} - {}'.format(self.from_amount, self.to_amount)

    class Meta:
        db_table = "order_fees"
        ordering = ['-to_amount']
