from django.db import models
from apps.area.models import Area


class DeliveryFeeUnitPriceType:
    MASS = 1
    VOLUME = 2


TYPES = (
    (DeliveryFeeUnitPriceType.MASS, 'Mass'),
    (DeliveryFeeUnitPriceType.VOLUME, 'Volume')
)


# Create your models here.
class DeliveryFee(models.Model):
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name='area_delivery_fees')
    start = models.FloatField()
    stop = models.FloatField()
    vnd_unit_price = models.IntegerField()
    type = models.IntegerField(choices=TYPES, default=1)

    def __str__(self):
        return '{} - {}'.format(self.start, self.stop)

    class Meta:
        db_table = "delivery_fees"
        ordering = ['-stop']
