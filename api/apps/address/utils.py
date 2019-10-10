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
    def match_uid(customer_id: int, area_code: str, last_uid: str) -> str:
        order = 0
        if last_uid:
            order = int(last_uid.split(area_code)[1]) + 1
        return "{}{}{}".format(customer_id, area_code, order)

    @staticmethod
    def uid_to_pk(uid: str) -> int:
        from .models import Address
        try:
            item = Address.objects.get(uid=uid)
            return item.pk
        except Address.DoesNotExist:
            return 0

    @staticmethod
    def generate_uid(customer_id: int, area_id: int) -> str:
        from .models import Address

        area = Area.objects.get(pk=area_id)
        area_code = area.uid
        last_address = Address.objects.filter(customer_id=customer_id, area_id=area.pk).order_by('-id')
        last_uid = ''
        if last_address.count():
            last_uid = last_address.first().uid
        return AddressUtils.match_uid(customer_id, area_code, last_uid)
