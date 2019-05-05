from django.db import models
from django.conf import settings


class CountCheckManager(models.Manager):
    def _seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.count_check.serializers import CountCheckBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
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

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

    def getMatchedFactor(self, items: float) -> float:
        result = self.filter(from_items__lte=items, to_items__gte=items)
        if result.count():
            return result.first().fee
        return settings.DEFAULT_COUNT_CHECK_UNIT_PRICE

# Create your models here.


class CountCheck(models.Model):
    from_items = models.IntegerField()
    to_items = models.IntegerField()
    fee = models.FloatField()

    objects = CountCheckManager()

    def __str__(self):
        return '{} - {}'.format(self.from_items, self.to_items)

    class Meta:
        db_table = "count_checks"
        ordering = ['-to_items']
