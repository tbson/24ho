from django.db import models
from utils.models.model import TimeStampedModel
from apps.customer.models import Customer
from apps.address.models import Address
from apps.delivery_fee.models import DeliveryFee, DeliveryFeeUnitPriceType
from apps.order.models import Order
from django.conf import settings


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
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.bol.serializers import BolBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        address = Address.objects.seeding(1, True)

        def get_data(i: int) -> dict:

            data = {
                'uid': "uid{}".format(i),
                'address': address.pk
            }
            if save is False:
                return data

            instance = BolBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    def get_mass(self, item: models.QuerySet) -> float:
        return item.input_mass

    def get_mass_convert(self, item: models.QuerySet) -> float:
        return item.width * item.height * item.length / item.mass_convert_factor

    def get_volume(self, item: models.QuerySet) -> float:
        return item.width * item.height * item.length / 1000000

    def cal_delivery_fee_range(self, item: models.QuerySet) -> dict:
        mass = self.get_mass(item)
        return {
            'MASS': DeliveryFee.objects.get_matched_unit_price(
                mass,
                item.address.area_id,
                DeliveryFeeUnitPriceType.MASS
            ),
            'VOLUME': DeliveryFee.objects.get_matched_unit_price(
                mass,
                item.address.area_id,
                DeliveryFeeUnitPriceType.VOLUME
            )
        }

    def cal_delivery_fee_mass_unit_price(self, item: models.QuerySet) -> dict:
        range_unit_price = self.cal_delivery_fee_range(item)['MASS']
        customer_unit_price = item.customer.delivery_fee_mass_unit_price
        bol_unit_price = item.mass_unit_price

        return {
            'RANGE': range_unit_price,
            'FIXED': bol_unit_price or customer_unit_price or 0
        }

    def cal_delivery_fee_volume_unit_price(self, item: models.QuerySet) -> dict:
        range_unit_price = self.cal_delivery_fee_range(item)['VOLUME']
        customer_unit_price = item.customer.delivery_fee_volume_unit_price
        bol_unit_price = item.volume_unit_price

        return {
            'RANGE': range_unit_price,
            'FIXED': bol_unit_price or customer_unit_price or 0
        }

    def cal_delivery_fee(self, item: models.QuerySet) -> dict:
        mass = self.get_mass(item)
        mass_convert = self.get_mass_convert(item)
        volume = self.get_volume(item)

        mass_unit_price = self.cal_delivery_fee_mass_unit_price(item)
        volume_unit_price = self.cal_delivery_fee_volume_unit_price(item)

        mass_range_price = mass * mass_unit_price['RANGE']
        mass_price = mass * mass_unit_price['FIXED']
        mass_convert_price = mass_convert * mass_unit_price['FIXED']
        volume_range_price = volume * volume_unit_price['RANGE']
        volume_price = volume * volume_unit_price['FIXED']

        delivery_fee = max(mass_price, mass_convert_price, mass_range_price, volume_price, volume_range_price)

        if item.delivery_fee_type == DeliveryFeeType.MASS_RANGE:
            delivery_fee = mass_range_price
        if item.delivery_fee_type == DeliveryFeeType.MASS:
            delivery_fee = mass_price
        if item.delivery_fee_type == DeliveryFeeType.MASS_CONVERT:
            delivery_fee = mass_convert_price
        if item.delivery_fee_type == DeliveryFeeType.VOLUME_RANGE:
            delivery_fee = volume_range_price
        if item.delivery_fee_type == DeliveryFeeType.VOLUME:
            delivery_fee = volume_price

        return {
            'mass_range_unit_price': mass_unit_price['RANGE'],
            'volume_range_unit_price': volume_unit_price['RANGE'],
            'delivery_fee': delivery_fee
        }

    def cal_insurance_fee(self, item: models.QuerySet) -> float:
        if not item.order and item.insurance_register:
            return item.insurance_value * settings.DEFAULT_INSURANCE_FACTOR / 100
        return 0

    def cal_shockproof_fee(self, item: models.QuerySet) -> float:
        if item.shockproof:
            return item.cny_shockproof_fee
        return 0

    def cal_wooden_box_fee(self, item: models.QuerySet) -> float:
        if item.wooden_box:
            return item.cny_wooden_box_fee
        return 0

    def re_cal(self, item: models.QuerySet) -> models.QuerySet:
        '''
        Frezee after export
        '''
        if not item.exported_date:
            data = self.cal_delivery_fee(item)
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

    packages = models.IntegerField(default=0)

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

    insurance_register = models.BooleanField(default=False)
    insurance_value = models.FloatField(default=0)
    insurance_note = models.CharField(max_length=250, blank=True)

    objects = BolManager()

    def __str__(self):
        return '{} - {}'.format(self.uid, self.value)

    class Meta:
        db_table = "bols"
        ordering = ['-id']
