from django.db import models
from django.db.models import Sum


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
        return data

    @staticmethod
    def is_assets(type: int) -> bool:
        from .models import Type
        if type == Type.RECHARGE:
            return True
        if type == Type.DEPOSIT:
            return False
        if type == Type.PAY:
            return False
        if type == Type.WITHDRAW:
            return False
        if type == Type.CN_DELIVERY_FEE:
            return False
        if type == Type.VN_DELIVERY_FEE:
            return False
        if type == Type.COMPLAINT_REFUND:
            return True
        if type == Type.DISCOUNT_REFUND:
            return True
        if type == Type.DISCARD_REFUND:
            return True
        if type == Type.OTHER_SUB_FEE:
            return False
        return False

    @staticmethod
    def get_customer_balance(id: int) -> int:
        from .models import Transaction
        query = Transaction.objects.filter(customer_id=id, is_assets=True)
        assets = query.filter(is_assets=True).aggregate(Sum('amount')).get('amount__sum')
        liabilities = query.filter(is_assets=False).aggregate(Sum('amount')).get('amount__sum')
        return assets - liabilities
