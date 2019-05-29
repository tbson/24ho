from django.db import models
from apps.order.models import Order


# Create your models here.
class OrderItem(models.Model):
    order = models.ForeignKey(Order, models.SET_NULL, related_name='order_items', null=True)

    title = models.CharField(max_length=500)
    url = models.CharField(max_length=500)

    color = models.CharField(max_length=500, blank=True)
    size = models.CharField(max_length=500, blank=True)
    image = models.CharField(max_length=500, blank=True)

    quantity = models.IntegerField(default=0)
    unit_price = models.FloatField(default=0)

    note = models.TextField(blank=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "order_items"
        ordering = ['-id']
        permissions = (
            ("change_color_orderitem", "Can change color"),
            ("change_size_orderitem", "Can change size"),
            ("change_quantity_orderitem", "Can change quantity"),
            ("change_unit_price_orderitem", "Can change unit price"),
            ("change_note_orderitem", "Can change note"),
        )
