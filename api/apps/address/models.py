from django.db import models
from apps.area.models import Area
from apps.customer.models import Customer


class Address(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='addresses')
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name='addresses')
    uid = models.CharField(max_length=250, unique=True)
    title = models.CharField(max_length=250)
    phone = models.CharField(max_length=250, blank=True)
    fullname = models.CharField(max_length=250, blank=True)

    def save(self, *args, **kwargs):
        from .utils import AddressUtils

        self.uid = AddressUtils.generate_uid(self.customer.pk, self.area.pk)

        super(Address, self).save(*args, **kwargs)

    def __str__(self):
        return '{} - {}'.format(self.area, self.title)

    class Meta:
        db_table = "addresses"
        ordering = ['-id']
