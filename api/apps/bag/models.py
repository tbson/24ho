from typing import Optional
from django.db import models
from utils.models.model import TimeStampedModel
from apps.area.models import Area


class BagManager(models.Manager):
    def get_or_create(self, title: str) -> Optional[models.QuerySet]:
        if not title:
            return None
        try:
            bag = self.get(title=title)
        except Bag.DoesNotExist:
            bag = self.create(title=title)
        return bag


class Bag(TimeStampedModel):
    area = models.ForeignKey(Area, models.PROTECT, related_name='area_bags')
    bol_date = models.IntegerField(null=True)
    uid = models.CharField(max_length=128, unique=True)
    objects = BagManager()

    def save(self, *args, **kwargs):
        from .utils import BagUtils
        if self._state.adding:
            self.uid = BagUtils.get_next_uid(self.area)
        super(Bag, self).save(*args, **kwargs)

    def __str__(self):
        return self.uid

    class Meta:
        db_table = "bags"
        ordering = ['-id']
