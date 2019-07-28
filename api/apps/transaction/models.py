from django.db import models
from utils.models.model import TimeStampedModel
from apps.customer.models import Customer
from apps.staff.models import Staff
from apps.order.models import Order
from utils.helpers.tools import Tools


class Type:
    RECHARGE = 1
    DEPOSIT = 2
    PAY = 3
    WITHDRAW = 4
    CN_DELIVERY_FEE = 5
    VN_DELIVERY_FEE = 6
    COMPLAINT_REFUND = 7
    DISCOUNT_REFUND = 8
    DISCARD_REFUND = 9
    OTHER_SUB_FEE = 10


class MoneyType:
    INDIRECT = 0
    CASH = 1
    TRANSFER = 2


TYPE_CHOICES = (
    (Type.RECHARGE, 'Nạp tiền'),
    (Type.DEPOSIT, 'Đặt cọc đơn'),
    (Type.PAY, 'Thanh toán đơn hàng'),
    (Type.WITHDRAW, 'Rút tiền'),
    (Type.CN_DELIVERY_FEE, 'Phí vận chuyển CN-VN'),
    (Type.VN_DELIVERY_FEE, 'Phí vận chuyển nội địa VN'),
    (Type.COMPLAINT_REFUND, 'Hoàn tiền khiếu nại'),
    (Type.DISCARD_REFUND, 'Hoàn tiền chiết khấu'),
    (Type.DISCARD_REFUND, 'Hoàn tiền huỷ đơn'),
    (Type.OTHER_SUB_FEE, 'Phụ phí khác'),
)

MONEY_TYPE_CHOICES = (
    (MoneyType.INDIRECT, 'Gián tiếp'),
    (MoneyType.CASH, 'Tiền mặt'),
    (MoneyType.TRANSFER, 'Chuyển khoản'),
)

# Create your models here.


class Transaction(TimeStampedModel):
    customer = models.ForeignKey(Customer, models.PROTECT, related_name='customer_transactions', null=True)
    customer_uid = models.CharField(max_length=64, blank=True)

    order = models.ForeignKey(Order, models.PROTECT, related_name='order_transactions', null=True)
    order_uid = models.CharField(max_length=64, blank=True)

    staff = models.ForeignKey(Staff, models.PROTECT, related_name='staff_transactions')

    uid = models.CharField(max_length=64, unique=True)
    amount = models.FloatField()
    type = models.IntegerField(choices=TYPE_CHOICES)
    money_type = models.IntegerField(choices=TYPE_CHOICES)
    note = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.uid:
            self.uid = Tools.get_uuid()
        super(Transaction, self).save(*args, **kwargs)

    def __str__(self):
        return self.uid

    class Meta:
        db_table = "transactions"
        ordering = ['-id']
