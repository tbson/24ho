from django.db import models
from django.utils import timezone
from django_filters import rest_framework as filters
from rest_framework.serializers import ValidationError
from utils.models.model import TimeStampedModel
from apps.customer.models import Customer
from apps.staff.models import Staff
from apps.address.models import Address
from apps.order.models import Order
from apps.bag.models import Bag
from apps.receipt.models import Receipt
from utils.helpers.tools import Tools


class LandingStatus:
    NEW = 1
    CN = 2
    VN = 3
    EXPORTED = 4


class DeliveryFeeType:
    MAX = 1
    MASS_RANGE = 2
    MASS = 3
    MASS_CONVERT = 4
    VOLUME_RANGE = 5
    VOLUME = 6


class BolManager(models.Manager):

    def re_cal(self, item: models.QuerySet) -> models.QuerySet:
        from .utils import BolUtils
        '''
        Frezee after export
        '''
        if not item.exported_date:
            data = BolUtils.cal_delivery_fee(item)
            item.__dict__.update(data)
            item.save()
        return item


class BolDateManager(models.Manager):
    def get_or_create(self, date: timezone) -> models.QuerySet:
        try:
            date_str = Tools.date_to_str(date)
            bol_date = self.get(date_str=date_str)
        except BolDate.DoesNotExist:
            bol_date = self.create(date=date)
        return bol_date
# Create your models here.


class BolDate(models.Model):
    date = models.DateField(editable=False)
    date_str = models.CharField(max_length=32)

    objects = BolDateManager()

    def __str__(self):
        return self.date_str

    def save(self, *args, **kwargs):
        self.date_str = Tools.date_to_str(self.date)
        super(BolDate, self).save(*args, **kwargs)

    class Meta:
        db_table = "bol_dates"
        ordering = ['-date']


class Bol(TimeStampedModel):

    STATUS_CHOICES = (
        (LandingStatus.NEW, 'Mới'),
        (LandingStatus.CN, 'Về TQ'),
        (LandingStatus.VN, 'Về VN'),
        (LandingStatus.EXPORTED, 'Đã xuất'),
    )

    DELIVERY_FEE_TYPE_CHOICES = (
        (DeliveryFeeType.MAX, '1. Max lợi nhuận'),
        (DeliveryFeeType.MASS_RANGE, '2. Thang khối lượng'),
        (DeliveryFeeType.MASS, '3. Đơn giá khối lượng'),
        (DeliveryFeeType.MASS_CONVERT, '4. Khối lượng quy đổi'),
        (DeliveryFeeType.VOLUME_RANGE, '5. Thang mét khối'),
        (DeliveryFeeType.VOLUME, '6. Đơn giá mét khối'),
    )

    receipt = models.ForeignKey(Receipt, models.SET_NULL, related_name='receipt_bols', null=True)

    bag = models.ForeignKey(Bag, models.SET_NULL, related_name='bag_bols', null=True)
    bol_date = models.ForeignKey(BolDate, models.SET_NULL, related_name='date_bols', null=True)
    order = models.ForeignKey(Order, models.SET_NULL, related_name='order_bols', null=True)
    customer = models.ForeignKey(Customer, models.SET_NULL, related_name='customer_bols', null=True)
    address = models.ForeignKey(Address, models.SET_NULL, related_name='address_bols', null=True)

    uid = models.CharField(max_length=60, unique=True)

    purchase_code = models.CharField(max_length=60, blank=True)
    address_code = models.CharField(max_length=60, blank=True)

    landing_status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    cn_date = models.DateTimeField(null=True)
    vn_date = models.DateTimeField(null=True)
    exported_date = models.DateTimeField(null=True)
    exporter = models.ForeignKey(Staff, models.SET_NULL, related_name='staff_bols', null=True)

    mass = models.FloatField(default=0)
    mass_convert_factor = models.IntegerField(default=6000)
    length = models.FloatField(default=0)
    width = models.FloatField(default=0)
    height = models.FloatField(default=0)

    mass_unit_price = models.IntegerField(default=0)
    volume_unit_price = models.IntegerField(default=0)
    mass_range_unit_price = models.IntegerField(default=0)
    volume_range_unit_price = models.IntegerField(default=0)

    delivery_fee_type = models.IntegerField(choices=DELIVERY_FEE_TYPE_CHOICES, default=1)

    delivery_fee = models.IntegerField(default=0)

    vnd_delivery_fee = models.IntegerField(default=0)

    shockproof = models.BooleanField(default=False)
    wooden_box = models.BooleanField(default=False)
    count_check = models.BooleanField(default=False)

    cny_sub_fee = models.FloatField(default=0)
    cny_shockproof_fee = models.FloatField(default=0)
    cny_wooden_box_fee = models.FloatField(default=0)

    rate = models.PositiveIntegerField(default=0)  # For transport bols only
    real_rate = models.PositiveIntegerField(default=0)  # For transport bols only

    packages = models.IntegerField(default=1)

    insurance = models.BooleanField(default=False)
    cny_insurance_value = models.FloatField(default=0)
    cny_insurance_fee = models.FloatField(default=0)

    note = models.CharField(max_length=250, blank=True)

    objects = BolManager()

    def save(self, *args, **kwargs):
        from apps.order.utils import OrderUtils
        from apps.rate.utils import RateUtils
        from .utils import BolUtils

        if self.uid:
            self.uid = self.uid.strip().upper()

        if self._state.adding:
            date = BolDate.objects.get_or_create(timezone.now())
            self.bol_date = date
            bag = self.bag
            if bag and not bag.bol_date:
                bag.bol_date = date.id
                bag.save()
        else:
            bol = Bol.objects.get(pk=self.id)
            if bol.exported_date and self.exported_date is not None:
                raise ValidationError({"detail": "Không thể chỉnh sửa thông tin đơn hàng đã xuất."})

        if self.order:
            self.shockproof = self.order.shockproof
            self.wooden_box = self.order.wooden_box
            self.count_check = self.order.count_check

        if self.purchase_code:
            try:
                order = Order.objects.get(purchase_code=self.purchase_code)
                self.order = order
            except Order.DoesNotExist:
                pass

        if self.order is not None:
            self.address = self.order.address
            if self.order.purchase_code:
                self.purchase_code = self.order.purchase_code
            self.insurance = False
            self.cny_insurance_value = 0
        else:
            latest_rate = RateUtils.get_latest_rate()
            self.rate = latest_rate['value']
            self.real_rate = latest_rate['real_value']
            self.cny_insurance_fee = BolUtils.cal_insurance_fee(self)

        if not self.address and not self.address_code:
            self.address_code = ''
            self.address = None

        # if self.address:
        #     self.address_code = self.address.uid
        elif self.address_code:
            self.address_code = self.address_code.strip().upper()
            try:
                address = Address.objects.get(uid=self.address_code)
                self.address = address
            except Address.DoesNotExist:
                pass

        if not self.packages:
            self.packages = 1

        if self.address:
            self.customer = self.address.customer

        self.vnd_delivery_fee = BolUtils.cal_delivery_fee(self).get('delivery_fee', 0)

        super(Bol, self).save(*args, **kwargs)
        order = self.order
        if order:
            order.do_not_check_exported = True
            Order.objects.re_cal(order)
            OrderUtils.check_paid_status(order)
            OrderUtils.check_dispatched_status(order)
            OrderUtils.check_cn_status(order)
            OrderUtils.check_vn_status(order)
            OrderUtils.check_exported_status(order)
            OrderUtils.check_done_status(order)

    def delete(self, *args, **kwargs):
        from apps.order.utils import OrderUtils
        order = self.order
        super(Bol, self).delete(*args, **kwargs)
        if order:
            order.do_not_check_exported = True
            Order.objects.re_cal(order)
            OrderUtils.check_paid_status(order)
            OrderUtils.check_dispatched_status(order)
            OrderUtils.check_cn_status(order)
            OrderUtils.check_vn_status(order)
            OrderUtils.check_exported_status(order)
            OrderUtils.check_done_status(order)

    def __str__(self):
        return self.uid

    class Meta:
        db_table = "bols"
        ordering = ['-id']
        permissions = (
            ("change_bag_bol", "Can change bag"),
            ("get_date_bol", "Can get date"),
            ("match_vn_bol", "Can get match VN bol"),
            ("ready_to_export_list_bol", "Can get bol to export"),
            ("export_bol", "Can export"),
            ("export_check_bol", "Can check before export"),
            ("mark_cn_bol", "Can mark bol arrived to CN store"),
            ("mark_cn_by_uploading_bol", "Can mark bol arrived to CN store by uploading"),
            ("unmark_cn_bol", "Can unmark bol arrived to CN store"),
        )


class BolFilter(filters.FilterSet):
    order_uid = filters.CharFilter(field_name='order__uid', lookup_expr='exact')
    purchase_code = filters.CharFilter(field_name='order__purchase_code', lookup_expr='exact')
    order_id = filters.NumberFilter(field_name="order_id", lookup_expr='exact')
    bol_date_id = filters.NumberFilter(field_name="bol_date_id", lookup_expr='exact')
    bag_id = filters.NumberFilter(field_name="bag_id", lookup_expr='exact')
    bag_uid = filters.CharFilter(field_name="bag__uid", lookup_expr='exact')
    customer = filters.NumberFilter(field_name='customer_id', lookup_expr='exact')
    sale = filters.NumberFilter(field_name='order__sale_id', lookup_expr='exact')
    cust_care = filters.NumberFilter(field_name='cust_care__cust_care_id', lookup_expr='exact')

    class Meta:
        model = Bol
        fields = {
            'order_uid': ['exact'],
            'uid': ['exact'],
            'purchase_code': ['exact'],
            'order_id': ['exact'],
            'bol_date_id': ['exact'],
            'bag_id': ['exact'],
            'bag_uid': ['exact'],
            'customer': ['exact'],
            'sale': ['exact'],
            'cust_care': ['exact'],
            'cn_date': ['exact', 'isnull', 'lt', 'gt', 'lte', 'gte'],
            'vn_date': ['exact', 'isnull', 'lt', 'gt', 'lte', 'gte'],
            'exported_date': ['exact', 'isnull', 'lt', 'gt', 'lte', 'gte']
        }
