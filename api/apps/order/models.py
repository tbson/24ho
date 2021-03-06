from django.db import models
from django_filters import rest_framework as filters
from django.contrib.postgres.fields import JSONField
from utils.models.model import TimeStampedModel
from apps.staff.models import Staff
from apps.address.models import Address
from apps.customer.models import Customer
from apps.receipt.models import Receipt
from utils.helpers.tools import Tools
from django.conf import settings


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


class OrderManager(models.Manager):

    def re_cal(self, item: models.QuerySet) -> models.QuerySet:
        from .utils import OrderUtils

        statistics = OrderUtils.cal_statistics(item)

        item.__dict__.update(OrderUtils.cal_all(item), statistics=statistics)

        item.save()
        return item

# Create your models here.


class Order(TimeStampedModel):

    uid = models.CharField(max_length=50, unique=True)

    receipt = models.ForeignKey(Receipt, models.SET_NULL, related_name='receipt_orders', null=True)

    address = models.ForeignKey(Address, models.PROTECT, related_name='address_orders')
    customer = models.ForeignKey(Customer, models.PROTECT, related_name='customer_orders')

    thumbnail = models.CharField(max_length=500, blank=True)
    purchase_code = models.CharField(max_length=250, blank=True)

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
    checker = models.ForeignKey(Staff, models.SET_NULL, related_name='checker_orders', null=True)
    approved_date = models.DateTimeField(null=True)
    checked_date = models.DateTimeField(null=True)

    rate = models.PositiveIntegerField()
    real_rate = models.PositiveIntegerField()

    cny_real_amount = models.FloatField(default=0)
    cny_amount = models.FloatField(default=0)
    vnd_amount = models.FloatField(default=0)
    cny_order_fee = models.FloatField(default=0)
    cny_inland_delivery_fee = models.FloatField(default=0)
    cny_count_check_fee = models.FloatField(default=0)
    cny_shockproof_fee = models.FloatField(default=0)
    cny_wooden_box_fee = models.FloatField(default=0)
    cny_sub_fee = models.FloatField(default=0)

    vnd_delivery_fee = models.PositiveIntegerField(default=0)
    vnd_sub_fee = models.PositiveIntegerField(default=0)

    vnd_delivery_fee_discount = models.PositiveIntegerField(default=0)
    cny_order_fee_discount = models.FloatField(default=0)
    cny_count_check_fee_discount = models.FloatField(default=0)

    order_fee_factor = models.FloatField(default=0)

    deposit_factor = models.FloatField(default=0)
    deposit = models.PositiveIntegerField(default=0)
    charge_remain = models.BooleanField(default=False)

    mass = models.FloatField(default=0)
    packages = models.PositiveIntegerField(default=0)
    number_of_bol = models.PositiveIntegerField(default=0)
    note = models.TextField(blank=True)
    statistics = JSONField(default=dict)
    status = models.PositiveIntegerField(choices=STATUS_CHOICES, default=1)
    pending = models.BooleanField(default=False)
    potential_bols = models.TextField(blank=True)

    objects = OrderManager()

    def save(self, *args, **kwargs):
        from .utils import OrderUtils
        from apps.bol.utils import BolUtils

        if not self._state.adding:
            self = OrderUtils.check_order_for_frozen(self)

            BolUtils.update_order_service(self)

        if self._state.adding and self.address and not self.uid:
            self.uid = OrderUtils.get_next_uid(self.address)

            self.customer = self.address.customer
            deposit_factor = self.customer.deposit_factor
            if not deposit_factor or deposit_factor < 0 or deposit_factor > 90:
                self.deposit_factor = settings.DEPOSIT_FACTOR
            else:
                self.deposit_factor = self.customer.deposit_factor

        if self._state.adding and self.address:
            customer = self.address.customer
            if not self.sale:
                self.sale = customer.sale
            if not self.cust_care:
                self.cust_care = customer.cust_care

        if self.purchase_code:
            self.purchase_code = self.purchase_code.strip()

        self.customer = self.address.customer

        if not Tools.is_testing():
            self.__dict__.update(OrderUtils.cal_all(self))
        super(Order, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        from .utils import OrderUtils
        OrderUtils.check_order_for_frozen(self, True)
        OrderUtils.cleanup_before_deleting(self)
        super(Order, self).delete(*args, **kwargs)

    def __str__(self):
        return self.address.title

    class Meta:
        db_table = "orders"
        ordering = ['-id']
        permissions = (
            ("change_sale_order", "Đổi nhân viên mua hàng"),
            ("change_cust_care_order", "Đổi nhân viên chăm sóc"),
            ("change_rate_order", "Đổi tỷ giá"),
            ("change_address_order", "Đổi địa chỉ"),
            ("change_voucher_order", "Đổi voucher"),
            ("change_count_check_fee_input_order", "Đổi giá kiểm kếm"),
            ("change_cny_inland_delivery_fee_order", "Đổi phí vận chuyển nội địa"),
            ("change_order_fee_factor_order", "Đổi hệ số phí dịch vụ"),
            ("change_purchase_code_order", "Đổi mã giao dịc"),
            ("change_status_order", "Đổi trạng thái"),
            ("change_shockproof_order", "Đổi trạng thái chống sốc"),
            ("change_wooden_box_order", "Đổi trạng thái đóng gỗ"),
            ("change_count_check_order", "Đổi trạng thái kiểm đếm"),
            ("change_cny_real_amount_order", "Đổi thanh toán thực"),
            ("bulk_approve_order", "Duyệt đơn"),
            ("get_order_items_for_checking_order", "Kiểm hàng chi tiết"),
            ("check_order", "Kiểm hàng"),
            ("complaint_resolve_order", "Giải quyết khiếu nại"),
            ("discard_order", "Huỷ đơn"),
            ("batch_update", "Sửa hàng loạt"),
        )


class OrderFilter(filters.FilterSet):
    bol = filters.CharFilter(field_name='order_bols__uid', lookup_expr='exact')
    item_url = filters.CharFilter(field_name='order_items__url', lookup_expr='exact')
    customer = filters.NumberFilter(field_name='customer_id', lookup_expr='exact')
    sale = filters.NumberFilter(field_name='sale_id', lookup_expr='exact')
    cust_care = filters.NumberFilter(field_name='cust_care_id', lookup_expr='exact')
    # approver = filters.NumberFilter(field_name='approver_id', lookup_expr='exact')
    # checker = filters.NumberFilter(field_name='checker_id', lookup_expr='exact')

    class Meta:
        model = Order
        fields = {
            'uid': ['exact'],
            'status': ['exact'],
            'pending': ['exact'],
            'purchase_code': ['exact'],
            'bol': ['exact'],
            'shop_nick': ['exact'],
            'item_url': ['exact'],
            'customer': ['exact'],
            'sale': ['exact'],
            'cust_care': ['exact'],
            'shockproof': ['exact'],
            'wooden_box': ['exact'],
            'count_check': ['exact'],
            'approved_date': ['exact', 'lt', 'gt', 'lte', 'gte'],
            'checked_date': ['exact', 'lt', 'gt', 'lte', 'gte'],
            'created_at': ['exact', 'lt', 'gt', 'lte', 'gte'],
            'updated_at': ['exact', 'lt', 'gt', 'lte', 'gte']
        }
