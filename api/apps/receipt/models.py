from django.db import models
from utils.models.model import TimeStampedModel
from apps.customer.models import Customer
from apps.staff.models import Staff
from apps.address.models import Address
from utils.helpers.tools import Tools


class Type:
    ORDER = 1
    TRANSPORT = 2


TYPE_CHOICES = (
    (Type.ORDER, 'Order'),
    (Type.TRANSPORT, 'Vận chuyển')
)

# Create your models here.


class Receipt(TimeStampedModel):
    customer = models.ForeignKey(Customer, models.PROTECT, related_name='customer_receipts')
    customer_username = models.CharField(max_length=64, blank=True)

    staff = models.ForeignKey(Staff, models.PROTECT, related_name='staff_receipts')
    staff_username = models.CharField(max_length=64, blank=True)

    address = models.ForeignKey(Address, models.PROTECT, related_name='address_receipts')
    address_code = models.CharField(max_length=64, blank=True)

    uid = models.CharField(max_length=60, unique=True)
    type = models.IntegerField(choices=TYPE_CHOICES, default=1)

    vnd_delivery_fee = models.IntegerField(default=0)
    vnd_total = models.IntegerField(default=0)
    note = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.uid:
            self.uid = Tools.get_uuid()
        if self.customer:
            self.customer_username = self.customer.user.username
        if self.staff:
            self.staff_username = self.staff.user.username
        if self.address:
            self.address_code = self.address.uid
        super(Receipt, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        from .utils import ReceiptUtils

        ReceiptUtils.cleanup_before_deleting(self)

        super(Receipt, self).delete(*args, **kwargs)

    def __str__(self):
        return self.uid

    class Meta:
        db_table = "receipts"
        ordering = ['-id']
        permissions = (
            ("retrieve_to_print", "In"),
        )
