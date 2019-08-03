from django.db import models
from apps.customer.utils import CustomerUtils
from apps.staff.utils import StaffUtils
from apps.address.utils import AddressUtils


class ReceiptUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import ReceiptBaseSr
        from .models import Type

        customer = CustomerUtils.seeding(1, True)
        staff = StaffUtils.seeding(1, True)
        address = AddressUtils.seeding(1, True)

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            data = {
                'customer': customer.pk,
                'staff': staff.pk,
                'address': address.pk,
                'type': Type.ORDER,
                'vnd_sub_fee': 1000 + i,
                'vnd_total': 10000 + i
            }
            if save is False:
                return data

            instance = ReceiptBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)
