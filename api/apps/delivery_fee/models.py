from django.db import models
from django.conf import settings
from apps.area.models import Area

TYPES = (
    (1, 'MASS'),
    (2, 'VOLUME')
)


class DeliveryFeeManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.delivery_fee.serializers import DeliveryFeeBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        area = Area.objects.seeding(1, True)

        def getData(i: int) -> dict:
            data = {
                'area': area.pk,
                'start': i * 10,
                'stop': i * 10 + 9,
                'vnd_unit_price': int(200000 / i),
                'type': 1
            }
            if save is False:
                return data

            instance = DeliveryFeeBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

    def getMatchedUnitPrice(self, value: float, type: int) -> float:
        if type not in dict(TYPES):
            raise Exception('Invalid type of delivery fee unit price.')

        result = self.filter(start__lte=value, stop__gte=value, type=type)
        if result.count():
            return result.first().vnd_unit_price
        if type == 1:
            return settings.DEFAULT_DELIVERY_MASS_UNIT_PRICE
        return settings.DEFAULT_DELIVERY_VOLUME_UNIT_PRICE


# Create your models here.
class DeliveryFee(models.Model):
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name='area_delivery_fees')
    start = models.FloatField()
    stop = models.FloatField()
    vnd_unit_price = models.IntegerField()
    type = models.IntegerField(choices=TYPES, default=1)

    objects = DeliveryFeeManager()

    def __str__(self):
        return '{} - {}'.format(self.start, self.stop)

    class Meta:
        db_table = "delivery_fees"
        ordering = ['-stop']
