from django.db import models
from apps.customer.utils import CustomerUtils
from apps.staff.utils import StaffUtils
from apps.address.utils import AddressUtils
from utils.helpers.tools import Tools


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

    @staticmethod
    def cleanup_before_deleting(receipt):
        transactions = receipt.receipt_transactions.all()
        for item in transactions:
            item.delete()

        bols = receipt.receipt_bols.all()
        for item in bols:
            item.receipt = None
            item.exported_date = None
            item.save()

        orders = receipt.receipt_bols.all()
        for item in orders:
            item.do_not_check_exported = True
            item.receipt = None
            item.save()

    @staticmethod
    def retrieve_to_print(receipt: models.QuerySet) -> dict:
        from .models import Type
        common = ReceiptUtils.retrieve_to_print_common(receipt)
        if receipt.type == Type.TRANSPORT:
            transport_data = ReceiptUtils.retrieve_to_print_transport(receipt)
            return {**common, **transport_data}
        if receipt.type == Type.ORDER:
            order_data = ReceiptUtils.retrieve_to_print_order(receipt)
            return {**common, **order_data}
        return common

    @staticmethod
    def retrieve_to_print_common(receipt: models.QuerySet) -> dict:
        from apps.variable.utils import VariableUtils
        from apps.address.serializers import AddressBaseSr

        return {
            'company_info': VariableUtils.get_company_info(),
            'customer': {
                'fullname': Tools.get_fullname(receipt.customer),
            },
            'staff': {
                'fullname': Tools.get_fullname(receipt.staff),
            },
            'address': AddressBaseSr(receipt.address).data,
            'uid': receipt.uid,
            'created_at': receipt.created_at,
            'vnd_delivery_fee': receipt.vnd_delivery_fee,
            'vnd_total': receipt.vnd_total,
            'note': receipt.note
        }

    @staticmethod
    def retrieve_to_print_transport(receipt: models.QuerySet) -> dict:
        from apps.bol.utils import BolUtils
        bols = BolUtils.calculate_transport_bol_fee(receipt.receipt_bols.all())
        return {
            'bols': bols
        }

    @staticmethod
    def retrieve_to_print_order(receipt: models.QuerySet) -> dict:
        from apps.bol.utils import BolUtils
        orders = BolUtils.calculate_order_remain(receipt.receipt_orders.all())
        return {
            'orders': orders
        }
