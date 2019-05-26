from django.db import models
from django.contrib.postgres.fields import JSONField
from utils.models.model import TimeStampedModel
from apps.staff.models import Staff
from apps.address.models import Address
from apps.customer.models import Customer


class Status:
    NEW = 1
    APPROVED = 2
    DEBT = 3
    PAID = 4
    DISPATCHED = 5
    CN_STORE = 6
    VN_STORE = 7
    EXPORTED = 8
    DONE = 9
    DISCARD = 10


class OrderManager(models.Manager):

    def re_cal(self, item: models.QuerySet) -> models.QuerySet:
        from .utils import OrderUtils
        '''
        Frezee after confirm
        '''
        item.cny_amount = OrderUtils.cal_amount(item)
        item.cny_order_fee = OrderUtils.cal_order_fee(item)
        # item.cny_inland_delivery_fee

        '''
        Frezee after export
        '''
        item.vnd_delivery_fee = OrderUtils.cal_delivery_fee(item)
        item.cny_count_check_fee = OrderUtils.cal_count_check_fee(item)
        item.cny_shockproof_fee = OrderUtils.cal_shockproof_fee(item)
        item.cny_wooden_box_fee = OrderUtils.cal_wooden_box_fee(item)
        # item.vnd_sub_fee

        item.statistics = OrderUtils.cal_statistics(item)

        item.save()
        return item

# Create your models here.


class Order(TimeStampedModel):

    STATUS_CHOICES = (
        (Status.NEW, 'Chờ duyệt'),
        (Status.APPROVED, 'Đã duyệt'),
        (Status.DEBT, 'Chờ thanh toán'),
        (Status.PAID, 'Đã thanh toán'),
        (Status.DISPATCHED, 'Đã phát hàng'),
        (Status.CN_STORE, 'Về kho TQ'),
        (Status.VN_STORE, 'Về kho VN'),
        (Status.EXPORTED, 'Đã xuất hàng'),
        (Status.DONE, 'Hoàn thành'),
        (Status.DISCARD, 'Huỷ'),
    )

    address = models.ForeignKey(Address, models.PROTECT, related_name='address_orders')
    customer = models.ForeignKey(Customer, models.PROTECT, related_name='customer_orders')

    thumbnail = models.CharField(max_length=500, blank=True)

    shop_link = models.CharField(max_length=250)
    shop_nick = models.CharField(max_length=250, blank=True)
    site = models.CharField(max_length=50)

    count_check = models.BooleanField(default=False)
    wooden_box = models.BooleanField(default=False)
    shockproof = models.BooleanField(default=False)

    count_check_fee_input = models.FloatField(default=0)

    sale = models.ForeignKey(Staff, models.SET_NULL, related_name='sale_orders', null=True)
    cust_care = models.ForeignKey(Staff, models.SET_NULL, related_name='cust_care_orders', null=True)
    approver = models.ForeignKey(Staff, models.SET_NULL, related_name='approver_orders', null=True)
    approved_date = models.DateTimeField(null=True)

    rate = models.PositiveIntegerField()
    real_rate = models.PositiveIntegerField()

    cny_amount = models.FloatField(default=0)
    cny_order_fee = models.FloatField(default=0)
    cny_inland_delivery_fee = models.FloatField(default=0)
    cny_count_check_fee = models.FloatField(default=0)
    cny_shockproof_fee = models.FloatField(default=0)
    cny_wooden_box_fee = models.FloatField(default=0)

    vnd_delivery_fee = models.PositiveIntegerField(default=0)
    vnd_sub_fee = models.PositiveIntegerField(default=0)

    vnd_paid = models.PositiveIntegerField(default=0)

    vnd_delivery_fee_discount = models.PositiveIntegerField(default=0)
    cny_order_fee_discount = models.FloatField(default=0)
    cny_count_check_fee_discount = models.FloatField(default=0)

    order_fee_factor = models.FloatField(default=0)

    deposit_factor = models.FloatField(default=0)

    mass = models.FloatField(default=0)
    packages = models.PositiveIntegerField(default=0)
    number_of_bol = models.PositiveIntegerField(default=0)
    note = models.TextField(blank=True)
    statistics = JSONField(default=dict)
    status = models.PositiveIntegerField(choices=STATUS_CHOICES, default=1)

    objects = OrderManager()

    def __str__(self):
        return self.address.title

    class Meta:
        db_table = "orders"
        ordering = ['-id']
        permissions = [
            ("change_sale_order", "Can change sale"),
            ("change_cust_care_order", "Can change customer care"),
        ]
