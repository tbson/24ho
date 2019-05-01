from django.db import models
from apps.order.models import Order


class OrderItemManager(models.Manager):
    def _seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.order_item.serializers import OrderItemBaseSr

        order = Order.objects._seeding(1, True)

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            data = {
                'order': order.id,
                'title': "title{}".format(i),
                'url': "url{}".format(i),
                'quantity': i,
                'unit_price': 50.5
            }
            if save is False:
                return data

            instance = OrderItemBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)


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

    objects = OrderItemManager()

    def __str__(self):
        return self.title

    class Meta:
        db_table = "order_items"
        ordering = ['-id']