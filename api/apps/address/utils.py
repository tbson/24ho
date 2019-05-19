from django.db import models
from apps.area.models import Area
from apps.customer.utils import CustomerUtils
from apps.area.utils import AreaUtils


class AddressUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.address.serializers import AddressBaseSr

        if index == 0:
            raise Exception('Indext must be start with 1.')

        customer = CustomerUtils.seeding(1, True)
        area = AreaUtils.seeding(1, True)

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

    @staticmethod
    def match_uid(customerId: int, areaCode: str, lastUid: str) -> str:
        order = 0
        if lastUid:
            order = int(lastUid.split(areaCode)[1]) + 1
        return "{}{}{}".format(customerId, areaCode, order)

    @staticmethod
    def generate_uid(customerId: int, areaId: int) -> str:
        from .models import Address

        area = Area.objects.get(pk=areaId)
        areaCode = area.uid
        lastAddress = Address.objects.filter(customer_id=customerId, area_id=area.pk).order_by('-id')
        lastUid = ''
        if lastAddress.count():
            lastUid = lastAddress.first().uid
        return AddressUtils.match_uid(customerId, areaCode, lastUid)
