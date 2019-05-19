from django.db import models
from apps.area.models import Area
from apps.customer.models import Customer


class Address(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='customer')
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name='area')
    uid = models.CharField(max_length=250, unique=True)
    title = models.CharField(max_length=250)
    phone = models.CharField(max_length=250, blank=True)
    fullname = models.CharField(max_length=250, blank=True)

    def __str__(self):
        return '{} - {}'.format(self.area, self.title)

    class Meta:
        db_table = "addresses"
        ordering = ['-id']
