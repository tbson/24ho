from django.db import models


# Create your models here.


class OrderFee(models.Model):
    from_amount = models.IntegerField()
    to_amount = models.IntegerField()
    fee = models.FloatField()

    def __str__(self):
        return '{} - {}'.format(self.from_amount, self.to_amount)

    class Meta:
        db_table = "order_fees"
        ordering = ['-to_amount']
