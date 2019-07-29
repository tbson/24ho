from django.db import models


class TransactionUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.staff.utils import StaffUtils
        from .serializers import TransactionBaseSr
        from .models import Type, MoneyType
        if index == 0:
            raise Exception('Indext must be start with 1.')
        staff = StaffUtils.seeding(1, True)

        def get_data(i: int) -> dict:
            data = {
                'amount': 1000 + i,
                'staff': staff.pk,
                'type': Type.RECHARGE,
                'money_type': MoneyType.CASH
            }
            if save is False:
                return data

            instance = TransactionBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def update_staff(data: dict, user: models.QuerySet) -> dict:
        data['staff'] = user.staff
        data['staff_username'] = user.username
        return data
