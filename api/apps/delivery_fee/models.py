from django.db import models
from django.conf import settings
from apps.area.models import Area


class DeliveryFeeUnitPriceType:
    MASS = 1
    VOLUME = 2


TYPES = (
    (DeliveryFeeUnitPriceType.MASS, 'Mass'),
    (DeliveryFeeUnitPriceType.VOLUME, 'Volume')
)


class DeliveryFeeManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.delivery_fee.serializers import DeliveryFeeBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        area = Area.objects.seeding(1, True)

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

    def get_matched_unit_price(self, value: float, area_id: int, type: int) -> float:
        if type not in dict(TYPES):
            raise Exception('Invalid type of delivery fee unit price.')

        result = self.filter(area_id=area_id, start__lte=value, stop__gte=value, type=type)
        if result.count():
            return result.first().vnd_unit_price
        if type == DeliveryFeeUnitPriceType.MASS:
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
