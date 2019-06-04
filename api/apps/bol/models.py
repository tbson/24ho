from django.db import models
from utils.models.model import TimeStampedModel
from apps.customer.models import Customer
from apps.address.models import Address
from apps.order.models import Order


class LandingStatus:
    NEW = 1
    CN = 2
    VN = 3
    EXPORTED = 4


class DeliveryFeeType:
    BLANK = 0
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


# Create your models here.
class Bol(TimeStampedModel):

    STATUS_CHOICES = (
        (LandingStatus.NEW, 'Mới'),
        (LandingStatus.CN, 'Về TQ'),
        (LandingStatus.VN, 'Về VN'),
        (LandingStatus.EXPORTED, 'Đã xuất'),
    )

    DELIVERY_FEE_TYPE_CHOICES = (
        (DeliveryFeeType.BLANK, 'Chưa xác định'),
        (DeliveryFeeType.MAX, 'Max lợi nhuận'),
        (DeliveryFeeType.MASS_RANGE, 'Thang khối lượng'),
        (DeliveryFeeType.MASS, 'Đơn giá khối lượng'),
        (DeliveryFeeType.MASS_CONVERT, 'Khối lượng quy đổi'),
        (DeliveryFeeType.VOLUME_RANGE, 'Thang mét khối'),
        (DeliveryFeeType.VOLUME, 'Đơn giá mét khối'),
    )

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

    mass = models.FloatField(default=0)
    mass_convert_factor = models.IntegerField(default=6000)
    length = models.FloatField(default=0)
    width = models.FloatField(default=0)
    height = models.FloatField(default=0)

    mass_unit_price = models.IntegerField(default=0)
    volume_unit_price = models.IntegerField(default=0)
    mass_range_unit_price = models.IntegerField(default=0)
    volume_range_unit_price = models.IntegerField(default=0)

    delivery_fee_type = models.IntegerField(choices=DELIVERY_FEE_TYPE_CHOICES, default=0)

    delivery_fee = models.IntegerField(default=0)

    shockproof = models.BooleanField(default=False)
    wooden_box = models.BooleanField(default=False)

    cny_shockproof_fee = models.FloatField(default=0)
    cny_wooden_box_fee = models.FloatField(default=0)

    packages = models.IntegerField(default=1)

    insurance = models.BooleanField(default=False)
    cny_insurance_value = models.FloatField(default=0)
    insurance_note = models.CharField(max_length=250, blank=True)

    objects = BolManager()

    def save(self, *args, **kwargs):
        if self.address:
            self.address_code = self.address.uid
        elif self.address_code:
            try:
                address = Address.objects.get(uid=self.address_code)
                self.address = address
            except Address.DoesNotExist:
                pass

        super().save(*args, **kwargs)

    def __str__(self):
        return '{} - {}'.format(self.uid, self.value)

    class Meta:
        db_table = "bols"
        ordering = ['-id']
