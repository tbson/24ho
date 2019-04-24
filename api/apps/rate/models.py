from django.utils import timezone
from django.db import models
from utils.models.model import TimeStampedModel


class RateManager(models.Manager):
    def _seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        if index == 0:
            raise Exception('Indext must be start with 1.')
        base_rate = 3432

        def getData(i: int) -> dict:
            data = {
                'rate': base_rate + i + 1,
                'buy_rate': base_rate + i + 2,
                'sell_rate': base_rate + i + 3,
                'order_rate': base_rate + i + 4,
            }
            if save is False:
                return data

            instance = self.create(**data)
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

    def duplicate(self):
        try:
            last_item = self.latest('pk')
        except Rate.DoesNotExist:
            return None
        if last_item.created_at > timezone.now() - timezone.timedelta(days=1):
            return None
        last_item.pk = None
        last_item.created_at = timezone.now()
        last_item.updated_at = timezone.now()
        last_item.save()
        return last_item


# Create your models here.
class Rate(TimeStampedModel):
    rate = models.IntegerField()
    buy_rate = models.IntegerField()
    sell_rate = models.IntegerField()
    order_rate = models.IntegerField()

    objects = RateManager()

    def __str__(self):
        return str(self.rate)

    class Meta:
        db_table = "rates"
        ordering = ['-id']
