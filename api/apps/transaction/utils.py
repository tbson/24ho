from django.db import models
from django.db.models import Sum
from rest_framework.serializers import ValidationError


error_messages = {
    'DUPLICATE_DEPOSIT_TRANSACTION': 'Đơn hàng này đã ghi nhận kế toán.'
}


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
        query = Transaction.objects.filter(customer_id=id)
        assets = query.filter(is_assets=True).aggregate(Sum('amount')).get('amount__sum') or 0
        liabilities = query.filter(is_assets=False).aggregate(Sum('amount')).get('amount__sum') or 0
        return assets - liabilities

    @staticmethod
    def recharge(amount: int, money_type: int, customer: models.QuerySet, staff: models.QuerySet, note: str) -> str:
        from .models import Type
        from .models import Transaction

        transaction = Transaction(
            customer=customer,
            staff=staff,
            amount=amount,
            type=Type.RECHARGE,
            money_type=money_type,
            note="Khách {} nạp tiền".format(customer.user.username)
        )
        transaction.save()
        return transaction.uid

    @staticmethod
    def deposit(order: models.QuerySet, staff: models.QuerySet):
        from .models import Type, MoneyType
        from .models import Transaction
        from apps.order.utils import OrderUtils

        TransactionUtils.undeposit(order)

        amount = OrderUtils.get_deposit_amount(order)
        can_deposit = OrderUtils.can_deposit(order)
        if not can_deposit:
            raise ValidationError("Đơn hàng {} không đủ tiền đặt cọc.".format(order.uid))

        transaction = Transaction(
            order=order,
            customer=order.customer,
            staff=staff,
            amount=amount,
            type=Type.DEPOSIT,
            money_type=MoneyType.INDIRECT,
            note="Đặt cọc đơn {}".format(order.uid)
        )
        transaction.save()

    @staticmethod
    def undeposit(order: models.QuerySet):
        from .models import Type
        for transaction in order.order_transactions.filter(type=Type.DEPOSIT):
            transaction.delete()

    @staticmethod
    def charge_bol_delivery_fee(
        amount: int,
        customer: models.QuerySet,
        staff: models.QuerySet,
        receipt: models.QuerySet,
        bol: models.QuerySet,
    ) -> str:
        from .models import Type, MoneyType
        from .models import Transaction

        transaction = Transaction(
            customer=customer,
            staff=staff,
            amount=amount,
            type=Type.CN_DELIVERY_FEE,
            money_type=MoneyType.INDIRECT,
            receipt=receipt,
            bol=bol,
            note="Tiền vận chuyển vận đơn {}".format(bol.uid)
        )
        transaction.save()
        return transaction.uid

    @staticmethod
    def charge_bol_other_sub_fee(
        amount: int,
        customer: models.QuerySet,
        staff: models.QuerySet,
        receipt: models.QuerySet,
        bol: models.QuerySet,
    ) -> str:
        from .models import Type, MoneyType
        from .models import Transaction

        transaction = Transaction(
            customer=customer,
            staff=staff,
            amount=amount,
            type=Type.OTHER_SUB_FEE,
            money_type=MoneyType.INDIRECT,
            receipt=receipt,
            bol=bol,
            note="Phụ phí khác vận đơn {}".format(bol.uid)
        )
        transaction.save()
        return transaction.uid

    @staticmethod
    def charge_receipt_other_sub_fee(
        amount: int,
        customer: models.QuerySet,
        staff: models.QuerySet,
        receipt: models.QuerySet
    ) -> str:
        from .models import Type, MoneyType
        from .models import Transaction

        transaction = Transaction(
            customer=customer,
            staff=staff,
            amount=amount,
            type=Type.OTHER_SUB_FEE,
            money_type=MoneyType.INDIRECT,
            receipt=receipt,
            note="Phụ phí khác phiếu thu {}".format(receipt.uid)
        )
        transaction.save()
        return transaction.uid

    @staticmethod
    def charge_order_remain(
        amount: int,
        customer: models.QuerySet,
        staff: models.QuerySet,
        receipt: models.QuerySet,
        order: models.QuerySet
    ) -> str:
        from .models import Type, MoneyType
        from .models import Transaction

        transaction = Transaction(
            customer=customer,
            staff=staff,
            amount=amount,
            type=Type.PAY,
            money_type=MoneyType.INDIRECT,
            receipt=receipt,
            order=order,
            note="Thanh toán đơn hàng {}".format(order.uid)
        )
        transaction.save()
        return transaction.uid
