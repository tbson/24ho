from django.db import models
from utils.models.model import TimeStampedModel
from apps.customer.models import Customer
from apps.staff.models import Staff
from apps.order.models import Order
from apps.bol.models import Bol
from utils.helpers.tools import Tools
from apps.receipt.models import Receipt
from apps.bank.models import Bank


class Type:
    RECHARGE = 1
    DEPOSIT = 2
    PAY = 3
    WITHDRAW = 4
    CN_DELIVERY_FEE = 5
    VN_DELIVERY_FEE = 6
    INSURANCE_FEE = 7
    COMPLAINT_REFUND = 8
    DISCOUNT_REFUND = 9
    DISCARD_REFUND = 10
    OTHER_SUB_FEE = 11


class MoneyType:
    INDIRECT = 0
    CASH = 1
    TRANSFER = 2


TYPE_CHOICES = (
    (Type.RECHARGE, 'Nạp tiền'),
    (Type.DEPOSIT, 'Đặt cọc đơn'),
    (Type.PAY, 'Thanh toán đơn hàng'),  # For order bols
    (Type.WITHDRAW, 'Rút tiền'),
    (Type.CN_DELIVERY_FEE, 'Phí vận chuyển CN-VN'),  # For transport bols
    (Type.VN_DELIVERY_FEE, 'Phí vận chuyển nội địa VN'),
    (Type.INSURANCE_FEE, 'Phí bảo hiểm'),
    (Type.COMPLAINT_REFUND, 'Hoàn tiền khiếu nại'),
    (Type.DISCOUNT_REFUND, 'Hoàn tiền chiết khấu'),
    (Type.DISCARD_REFUND, 'Hoàn tiền huỷ đơn'),
    (Type.OTHER_SUB_FEE, 'Phụ phí khác'),  # For transport bols
)

MONEY_TYPE_CHOICES = (
    (MoneyType.INDIRECT, 'Gián tiếp'),
    (MoneyType.CASH, 'Tiền mặt'),
    (MoneyType.TRANSFER, 'Chuyển khoản'),
)

# Create your models here.


class Transaction(TimeStampedModel):
    receipt = models.ForeignKey(Receipt, models.PROTECT, related_name='receipt_transactions', null=True)

    customer = models.ForeignKey(Customer, models.PROTECT, related_name='customer_transactions', null=True)
    customer_username = models.CharField(max_length=64, blank=True)

    bank = models.ForeignKey(Bank, models.PROTECT, related_name='bank_transactions', null=True)

    staff = models.ForeignKey(Staff, models.PROTECT, related_name='staff_transactions')
    staff_username = models.CharField(max_length=64, blank=True)

    order = models.ForeignKey(Order, models.PROTECT, related_name='order_transactions', null=True)
    order_uid = models.CharField(max_length=64, blank=True)

    bol = models.ForeignKey(Bol, models.PROTECT, related_name='order_transactions', null=True)
    bol_uid = models.CharField(max_length=64, blank=True)

    uid = models.CharField(max_length=64, unique=True)
    amount = models.FloatField()
    balance = models.FloatField(default=0)
    type = models.IntegerField(choices=TYPE_CHOICES)
    money_type = models.IntegerField(choices=MONEY_TYPE_CHOICES)
    is_assets = models.BooleanField(default=True)
    note = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        from .utils import TransactionUtils

        self.is_assets = TransactionUtils.is_assets(self.type)

        if not self.uid:
            self.uid = Tools.get_uuid()

        if self.customer:
            self.customer_username = Tools.get_fullname(self.customer.user, True)
        if self.staff:
            self.staff_username = Tools.get_fullname(self.staff.user, True)

        if self.order:
            self.order_uid = self.order.uid
        if self.bol:
            self.bol_uid = self.bol.uid
        self.balance = TransactionUtils.get_transaction_balance(self)

        super(Transaction, self).save(*args, **kwargs)

    def __str__(self):
        return self.uid
    # retrieve_to_print

    class Meta:
        db_table = "transactions"
        ordering = ['-id']
        permissions = (
            ("retrieve_to_print", "Can print transaction"),
            ("get_total_statistics", "Get total statistics"),
        )
