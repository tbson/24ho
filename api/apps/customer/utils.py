from django.db import models
from utils.helpers.test_helpers import TestHelpers


class CustomerUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import CustomerBaseSr
        from .models import Customer

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            user = TestHelpers.user_seeding(i, True)
            data = {
                "user": user.pk,
                "phone": "00{}".format(i),
            }

            if save is False:
                return data

            try:
                instance = Customer.objects.get(user_id=user.pk)
            except Customer.DoesNotExist:
                instance = CustomerBaseSr(data=data)
                instance.is_valid(raise_exception=True)
                instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)
