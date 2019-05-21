from django.utils import timezone
from django.db import models
from utils.models.model import TimeStampedModel


# Create your models here.
class Rate(TimeStampedModel):
    rate = models.IntegerField()
    sub_delta = models.IntegerField()
    order_delta = models.IntegerField()

    def __str__(self):
        return str(self.rate)

    class Meta:
        db_table = "rates"
        ordering = ['-id']
