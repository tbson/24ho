from django.db import models
from utils.models.model import TimeStampedModel
from apps.staff.models import Staff
from apps.address.models import Address
from utils.helpers.tools import OrderStatus


class OrderManager(models.Manager):
    def _seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.address.models import Address
        from apps.order.serializers import OrderBaseSr

        address = Address.objects._seeding(1, True)

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            data = {
                'address': address.id,
                'shop_link': "shop_link{}".format(i),
                'shop_nick': "shop_nick{}".format(i),
                'site': "site{}".format(i),
                'rate': 3400,
                'real_rate': 3300
            }
            if save is False:
                return data

            instance = OrderBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

    def sumCny(self, order: dict) -> float:
        order_fee_factor = order.get('order_fee_factor', 0)
        cny_amount = order.get('cny_amount', 0)
        cny_order_fee = cny_amount * order_fee_factor / 100
        cny_inland_delivery_fee = order.get('cny_inland_delivery_fee', 0)
        cny_sub_fee = order.get('cny_sub_fee', 0)
        cny_insurance_fee = order.get('cny_insurance_fee', 0)

        series = [
            cny_amount,
            cny_order_fee,
            cny_inland_delivery_fee,
            cny_sub_fee,
            cny_insurance_fee
        ]

        return sum(series)

    def sumVnd(self, order: dict) -> int:
        vnd_delivery_fee = order.get('vnd_delivery_fee', 0)
        vnd_sub_fee = order.get('vnd_sub_fee', 0)

        series = [
            vnd_delivery_fee,
            vnd_sub_fee
        ]

        return sum(series)

    def getVndTotal(self, order: dict) -> int:
        rate = order['rate']
        cny = self.sumCny(order)
        vnd = self.sumVnd(order)
        return int(rate * cny + vnd)

# Create your models here.


class Order(TimeStampedModel):
    STATUS_CHOICES = (
        (OrderStatus.NEW, 'Chờ duyệt'),
        (OrderStatus.APPROVED, 'Đã duyệt'),
        (OrderStatus.DEBT, 'Chờ thanh toán'),
        (OrderStatus.PAID, 'Đã thanh toán'),
        (OrderStatus.DISPATCHED, 'Đã phát hàng'),
        (OrderStatus.CN_STORE, 'Về kho TQ'),
        (OrderStatus.VN_STORE, 'Về kho VN'),
        (OrderStatus.EXPORTED, 'Đã xuất hàng'),
        (OrderStatus.DONE, 'Hoàn thành'),
        (OrderStatus.DISCARD, 'Huỷ'),
    )

    address = models.ForeignKey(Address, models.SET_NULL, related_name='order', null=True)

    shop_link = models.CharField(max_length=250)
    shop_nick = models.CharField(max_length=250, blank=True)
    site = models.CharField(max_length=50)

    count_check = models.BooleanField(default=False)
    wooden_box = models.BooleanField(default=False)
    shockproof = models.BooleanField(default=False)

    cust_care = models.ForeignKey(Staff, models.SET_NULL, related_name='cust_care_orders', null=True)
    approver = models.ForeignKey(Staff, models.SET_NULL, related_name='approver_orders', null=True)
    approved_date = models.DateTimeField(null=True)

    rate = models.IntegerField()
    real_rate = models.IntegerField()

    cny_amount = models.FloatField(default=0)
    cny_inland_delivery_fee = models.FloatField(default=0)
    cny_sub_fee = models.FloatField(default=0)
    cny_insurance_fee = models.FloatField(default=0)

    vnd_delivery_fee = models.IntegerField(default=0)
    vnd_sub_fee = models.IntegerField(default=0)

    order_fee_factor = models.FloatField(default=0)
    deposit_factor = models.FloatField(default=0)
    mass = models.FloatField(default=0)
    packages = models.IntegerField(default=0)
    number_of_bol = models.IntegerField(default=0)
    note = models.TextField(blank=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)

    objects = OrderManager()

    def __str__(self):
        return self.address.title

    class Meta:
        db_table = "orders"
        ordering = ['-id']
