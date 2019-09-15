from django.db import models
from apps.customer.models import Customer


# Create your models here.
class CustomerBank(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='customer_banks')
    bank_name = models.CharField(max_length=128)
    account_name = models.CharField(max_length=128)
    account_number = models.CharField(max_length=60)

    def __str__(self):
        return '{} - {}'.format(self.account_name, self.account_number)

    class Meta:
        db_table = "customer_banks"
        ordering = ['-id']
