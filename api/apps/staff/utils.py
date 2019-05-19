from django.db import models
from utils.helpers.test_helpers import TestHelpers
from .models import Staff


class StaffUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import StaffBaseSr

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            user = TestHelpers.user_seeding(i, True)
            data = {
                "user": user.pk,
                "is_sale": i % 2 == 1,
                "is_cust_care": i % 2 == 0
            }

            if save is False:
                return data

            try:
                instance = Staff.objects.get(user_id=user.pk)
            except Staff.DoesNotExist:
                instance = StaffBaseSr(data=data)
                instance.is_valid(raise_exception=True)
                instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def getName(pk):
        try:
            item = Staff.objects.get(pk=pk)
            return "{} {}".format(item.user.last_name, item.user.first_name)
        except Staff.DoesNotExist:
            return ''
