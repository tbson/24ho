from django.utils import timezone
from django.db import models
from utils.models.model import TimeStampedModel


class RateManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
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

            instance = self.create(**data)
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

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
    sub_delta = models.IntegerField()
    order_delta = models.IntegerField()

    objects = RateManager()

    def __str__(self):
        return str(self.rate)

    class Meta:
        db_table = "rates"
        ordering = ['-id']
