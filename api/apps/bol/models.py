from django.db import models
from utils.models.model import TimeStampedModel
from utils.helpers.tools import LandingStatus
from apps.customer.models import Customer
from apps.address.models import Address


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


# Create your models here.
class Bol(TimeStampedModel):
    STATUS_CHOICES = (
        (LandingStatus.NEW, 'Mới'),
        (LandingStatus.CN, 'Về TQ'),
        (LandingStatus.VN, 'Về VN'),
        (LandingStatus.EXPORTED, 'Đã xuất'),
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
