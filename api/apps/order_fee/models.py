from django.db import models


class OrderFeeManager(models.Manager):
    def _seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.order_fee.serializers import OrderFeeBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
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

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)


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
