from django.db import models
from utils.models.model import TimeStampedModel
from utils.helpers.tools import DeliveryFeeType
from apps.customer.models import Customer
from apps.address.models import Address
from apps.delivery_fee.models import DeliveryFee
from django.conf import settings


class BolManager(models.Manager):
    def _seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.bol.serializers import BolBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            data = {
                'uid': "uid{}".format(i),
            }
            if save is False:
                return data

            instance = BolBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

    def getConvertMass(self, item: models.QuerySet) -> float:
        return item.width * item.height * item.length / item.mass_convert_factor

    def getVolume(self, item: models.QuerySet) -> float:
        return item.width * item.height * item.length / 1000000

    def getMass(self, item: models.QuerySet) -> float:
        return max(item.input_mass, self.getConvertMass(item))

    def calDeliveryFeeRange(self, item: models.QuerySet) -> int:
        mass = self.getMass(item)
        return DeliveryFee.objects.getMatchedUnitPrice(mass)

    def calDeliveryFeeMass(self, item: models.QuerySet) -> int:
        deliveryFeeUnitPrice = item.customer.delivery_fee_mass_unit_price
        if item.delivery_fee_mass_unit_price:
            deliveryFeeUnitPrice = item.delivery_fee_mass_unit_price
        if not deliveryFeeUnitPrice:
            deliveryFeeUnitPrice = settings.DEFAULT_DELIVERY_MASS_UNIT_PRICE
        mass = self.getMass(item)
        return deliveryFeeUnitPrice * mass

    def calDeliveryFeeVolume(self, item: models.QuerySet) -> int:
        deliveryFeeUnitPrice = item.customer.delivery_fee_volume_unit_price
        if item.delivery_fee_volume_unit_price:
            deliveryFeeUnitPrice = item.delivery_fee_volume_unit_price
        if not deliveryFeeUnitPrice:
            deliveryFeeUnitPrice = settings.DEFAULT_DELIVERY_VOLUME_UNIT_PRICE
        volume = self.getVolume(item)
        return deliveryFeeUnitPrice * volume

    def calDeliveryFee(self, item: models.QuerySet) -> int:
        fromRange = self.calDeliveryFeeRange(item)
        fromMass = self.calDeliveryFeeMass(item)
        fromVolume = self.calDeliveryFeeVolume(item)

        result = max(fromRange, fromMass, fromVolume)

        if fromRange and item.delivery_fee_type == DeliveryFeeType.RANGE:
            result = fromRange

        if fromMass and item.delivery_fee_type == DeliveryFeeType.MASS:
            result = fromMass

        if fromVolume and item.delivery_fee_type == DeliveryFeeType.VOLUME:
            result = fromVolume

        return result


# Create your models here.
class Bol(TimeStampedModel):
    STATUS_CHOICES = (
        (1, 'Mới'),
        (2, 'Về TQ'),
        (3, 'Về VN'),
        (4, 'Đã xuất'),
    )

    DELIVERY_FEE_TYPE_CHOICES = (
        (1, 'Max lợi nhuận'),
        (2, 'Thang khối lượng'),
        (3, 'Đơn giá khối lượng'),
        (4, 'Đơn giá mét khối'),
    )

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

    delivery_fee_mass_unit_price = models.IntegerField(default=0)
    delivery_fee_volume_unit_price = models.IntegerField(default=0)

    delivery_fee_type = models.IntegerField(choices=DELIVERY_FEE_TYPE_CHOICES, default=1)

    mass_convert_factor = models.IntegerField(default=6000)

    input_mass = models.FloatField(default=0)
    convert_mass = models.FloatField(default=0)
    convert_volume = models.FloatField(default=0)

    length = models.FloatField(default=0)
    width = models.FloatField(default=0)
    height = models.FloatField(default=0)

    wooden_box = models.BooleanField(default=False)
    shockproof = models.BooleanField(default=False)

    insurance_register = models.BooleanField(default=False)
    insurance_value = models.FloatField(default=0)
    insurance_note = models.CharField(max_length=250, blank=True)

    objects = BolManager()

    def __str__(self):
        return '{} - {}'.format(self.uid, self.value)

    class Meta:
        db_table = "bols"
        ordering = ['-id']
