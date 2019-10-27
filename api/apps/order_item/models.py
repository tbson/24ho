from django.db import models
from apps.order.models import Order


# Create your models here.
class OrderItem(models.Model):
    order = models.ForeignKey(Order, models.CASCADE, related_name='order_items', null=True)

    title = models.CharField(max_length=500)
    url = models.CharField(max_length=500)

    color = models.CharField(max_length=500, blank=True)
    size = models.CharField(max_length=500, blank=True)
    image = models.CharField(max_length=500, blank=True)

    quantity = models.IntegerField(default=0)
    checked_quantity = models.IntegerField(default=0)
    unit_price = models.FloatField(default=0)

    note = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if self._state.adding:
            self.checked_quantity = self.quantity

        super(OrderItem, self).save(*args, **kwargs)
        Order.objects.re_cal(self.order)

    def delete(self, *args, **kwargs):
        order = self.order
        super(OrderItem, self).delete(*args, **kwargs)
        Order.objects.re_cal(order)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "order_items"
        ordering = ['-id']
        permissions = (
            ("change_color_orderitem", "Đổi màu"),
            ("change_size_orderitem", "Đổi size"),
            ("change_quantity_orderitem", "Đổi số lượng"),
            ("change_unit_price_orderitem", "Đổi đơn giá"),
            ("change_note_orderitem", "Đổi ghi chú"),
        )
