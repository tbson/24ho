from django.db import models
from django.conf import settings
from apps.area.models import Area


class DeliveryFeeManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.delivery_fee.serializers import DeliveryFeeBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        area = Area.objects.seeding(1, True)

        def getData(i: int) -> dict:
            data = {
                'area': area.pk,
                'from_mass': i * 10,
                'to_mass': i * 10 + 9,
                'fee': int(200000 / i)
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

    def getMatchedUnitPrice(self, mass: float) -> float:
        result = self.filter(from_mass__lte=mass, to_mass__gte=mass)
        if result.count():
            return result.first().fee
        return settings.DEFAULT_DELIVERY_MASS_UNIT_PRICE


# Create your models here.
class DeliveryFee(models.Model):
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name='area_delivery_fees')
    from_mass = models.IntegerField()
    to_mass = models.IntegerField()
    fee = models.IntegerField()

    objects = DeliveryFeeManager()

    def __str__(self):
        return '{} - {}'.format(self.from_mass, self.to_mass)

    class Meta:
        db_table = "delivery_fees"
        ordering = ['-to_mass']
