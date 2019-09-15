from django.db import models
from apps.customer.utils import CustomerUtils


class CustomerBankUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import CustomerBankBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        customer = CustomerUtils.seeding(1, True)

        def get_data(i: int) -> dict:
            data = {
                'customer': customer.pk,
                'bank_name': "bank_name{}".format(i),
                'account_name': "name{}".format(i),
                'account_number': "123{}".format(i)
            }
            if save is False:
                return data

            instance = CustomerBankBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)
