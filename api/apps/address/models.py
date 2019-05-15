from django.db import models
from apps.area.models import Area
from apps.customer.models import Customer


class AddressService():
    @staticmethod
    def matchUid(customerId: int, areaCode: str, lastUid: str) -> str:
        order = 0
        if lastUid:
            order = int(lastUid.split(areaCode)[1]) + 1
        return "{}{}{}".format(customerId, areaCode, order)

# Create your models here.


class AddressManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.address.serializers import AddressBaseSr

        if index == 0:
            raise Exception('Indext must be start with 1.')

        customer = Customer.objects.seeding(1, True)
        area = Area.objects.seeding(1, True)

        def get_data(i: int) -> dict:
            data = {
                'customer': customer.pk,
                'area': area.pk,
                'title': "title{}".format(i),
                'phone': "phone{}".format(i),
                'fullname': "fullname{}".format(i)
            }

            if save is False:
                return data

            instance = AddressBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    def generatetUid(self, customerId: int, areaId: int) -> str:
        area = Area.objects.get(pk=areaId)
        areaCode = area.uid
        lastAddress = self.filter(customer_id=customerId, area_id=area.pk).order_by('-id')
        lastUid = ''
        if lastAddress.count():
            lastUid = lastAddress.first().uid
        return AddressService.matchUid(customerId, areaCode, lastUid)


class Address(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='customer')
    area = models.ForeignKey(Area, on_delete=models.CASCADE, related_name='area')
    uid = models.CharField(max_length=250, unique=True)
    title = models.CharField(max_length=250)
    phone = models.CharField(max_length=250, blank=True)
    fullname = models.CharField(max_length=250, blank=True)

    objects = AddressManager()

    def __str__(self):
        return '{} - {}'.format(self.area, self.title)

    class Meta:
        db_table = "addresses"
        ordering = ['-id']
