from django.db import models
from django.utils import timezone
from apps.address.utils import AddressUtils
from apps.delivery_fee.models import DeliveryFeeUnitPriceType
from apps.delivery_fee.utils import DeliveryFeeUtils
from django.conf import settings
from utils.helpers.tools import Tools

error_messages = {
    "EXPORT_MISSING_ADDRESS": "Có ít nhất 1 vận đơn thiếu mã địa chỉ.",
    "EXPORT_MISSING_CN_DATE": "Có ít nhất 1 vận đơn chưa về kho TQ.",
    "EXPORT_ALREADY": "Có ít nhất 1 vận đơn đã được xuất.",
    "EXPORT_MISSING_BOLS": "Có ít nhất 1 vận đơn vừa bị xoá.",
    "EXPORT_MIX_BOLS": "Không thể xuất lẫn vận đơn vận chuyển và order.",
    "EXPORT_INCOMPLETE_ORDER_BOLS": "Không thể xuất lẻ vận đơn của đơn hàng.",
    "EXPORT_MULTIPLE_CUSTOMER_BOLS": "Không thể xuất cho nhiều khách hàng.",
}


class BolUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True, **kwargs) -> models.QuerySet:
        from .serializers import BolBaseSr

        if index == 0:
            raise Exception('Indext must be start with 1.')

        address = AddressUtils.seeding(1, True)

        def get_data(i: int) -> dict:

            data = {
                'uid': "UID{}".format(i),
                'address': address.pk
            }

            _order = kwargs.get('order', None)
            if _order is not None:
                data['order'] = _order.pk

            if save is False:
                return data

            instance = BolBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def get_mass(item: models.QuerySet) -> float:
        return item.mass

    @staticmethod
    def get_mass_convert(item: models.QuerySet) -> float:
        return item.width * item.height * item.length / item.mass_convert_factor

    @staticmethod
    def get_volume(item: models.QuerySet) -> float:
        return item.width * item.height * item.length / 1000000

    @staticmethod
    def cal_delivery_fee_range(item: models.QuerySet) -> dict:
        if not item.address:
            return {
                'MASS': 0,
                'VOLUME': 0
            }
        mass = BolUtils.get_mass(item)
        return {
            'MASS': DeliveryFeeUtils.get_matched_unit_price(
                mass,
                item.address.area_id,
                DeliveryFeeUnitPriceType.MASS
            ),
            'VOLUME': DeliveryFeeUtils.get_matched_unit_price(
                mass,
                item.address.area_id,
                DeliveryFeeUnitPriceType.VOLUME
            )
        }

    @staticmethod
    def cal_delivery_fee_mass_unit_price(item: models.QuerySet) -> dict:
        range_unit_price = BolUtils.cal_delivery_fee_range(item)['MASS']
        customer_unit_price = item.customer.delivery_fee_mass_unit_price if item.customer else 0
        bol_unit_price = item.mass_unit_price

        return {
            'RANGE': range_unit_price,
            'FIXED': bol_unit_price or customer_unit_price or 0
        }

    @staticmethod
    def cal_delivery_fee_volume_unit_price(item: models.QuerySet) -> dict:
        range_unit_price = BolUtils.cal_delivery_fee_range(item)['VOLUME']
        customer_unit_price = item.customer.delivery_fee_volume_unit_price if item.customer else 0
        bol_unit_price = item.volume_unit_price

        return {
            'RANGE': range_unit_price,
            'FIXED': bol_unit_price or customer_unit_price or 0
        }

    @staticmethod
    def cal_delivery_fee(item: models.QuerySet) -> dict:
        from .models import DeliveryFeeType
        mass = BolUtils.get_mass(item)
        mass_convert = BolUtils.get_mass_convert(item)
        volume = BolUtils.get_volume(item)

        mass_unit_price = BolUtils.cal_delivery_fee_mass_unit_price(item)
        volume_unit_price = BolUtils.cal_delivery_fee_volume_unit_price(item)

        mass_range_price = mass * mass_unit_price['RANGE']
        mass_price = mass * mass_unit_price['FIXED']
        mass_convert_price = mass_convert * mass_unit_price['FIXED']
        volume_range_price = volume * volume_unit_price['RANGE']
        volume_price = volume * volume_unit_price['FIXED']

        delivery_fee = max(mass_price, mass_convert_price, mass_range_price, volume_price, volume_range_price)

        if item.delivery_fee_type == DeliveryFeeType.MASS_RANGE:
            delivery_fee = mass_range_price
        if item.delivery_fee_type == DeliveryFeeType.MASS:
            delivery_fee = mass_price
        if item.delivery_fee_type == DeliveryFeeType.MASS_CONVERT:
            delivery_fee = mass_convert_price
        if item.delivery_fee_type == DeliveryFeeType.VOLUME_RANGE:
            delivery_fee = volume_range_price
        if item.delivery_fee_type == DeliveryFeeType.VOLUME:
            delivery_fee = volume_price

        return {
            'mass_range_unit_price': mass_unit_price['RANGE'],
            'volume_range_unit_price': volume_unit_price['RANGE'],
            'delivery_fee': delivery_fee
        }

    @staticmethod
    def cal_insurance_fee(item: models.QuerySet) -> float:
        if not item.order and item.insurance:
            return item.cny_insurance_value * settings.DEFAULT_INSURANCE_FACTOR / 100
        return 0

    @staticmethod
    def cal_shockproof_fee(item: models.QuerySet) -> float:
        if item.shockproof:
            return item.cny_shockproof_fee
        return 0

    @staticmethod
    def cal_wooden_box_fee(item: models.QuerySet) -> float:
        if item.wooden_box:
            return item.cny_wooden_box_fee
        return 0

    @staticmethod
    def partial_update(obj, key, value):
        from .serializers import BolBaseSr
        data = {}
        data[key] = value
        serializer = BolBaseSr(obj, data=data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return serializer

    @staticmethod
    def export_missing_address(bols: models.QuerySet) -> str:
        if bols.filter(address__isnull=True).count():
            return error_messages['EXPORT_MISSING_ADDRESS']
        return ""

    @staticmethod
    def export_missing_cn_date(bols: models.QuerySet) -> str:
        if bols.filter(cn_date__isnull=True).count():
            return error_messages['EXPORT_MISSING_CN_DATE']
        return ""

    @staticmethod
    def export_already(bols: models.QuerySet) -> str:
        if bols.filter(exported_date__isnull=False).count():
            return error_messages['EXPORT_ALREADY']
        return ""

    @staticmethod
    def export_no_missing_bols(bols: models.QuerySet, ids: list) -> str:
        if bols.count() != len(ids):
            return error_messages['EXPORT_MISSING_BOLS']
        return ""

    @staticmethod
    def export_no_mix_bols(bols: models.QuerySet, ids: list) -> str:
        number_of_order_bols = bols.filter(order=None).count()
        if number_of_order_bols > 0 and number_of_order_bols < len(ids):
            return error_messages['EXPORT_MIX_BOLS']
        return ""

    @staticmethod
    def export_no_incomplete_order_bols(bols: models.QuerySet, ids: list) -> str:
        orders_have_multiple_bols = {}
        for bol in bols:
            if bol.order and bol.order.order_bols.count() > 1:
                orders_have_multiple_bols[str(bol.order.pk)] = bol.order
        orders = orders_have_multiple_bols.values()

        for order in orders:
            sub_bols = [bol.pk for bol in order.order_bols.all()]
            if Tools.is_semi_contain(ids, sub_bols):
                return error_messages['EXPORT_INCOMPLETE_ORDER_BOLS']
        return ""

    @staticmethod
    def export_no_multiple_customer_bols(bols: models.QuerySet) -> str:
        customers = [bol.customer.pk for bol in bols]
        if len(set(customers)) > 1:
            return error_messages['EXPORT_MULTIPLE_CUSTOMER_BOLS']
        return ""

    @staticmethod
    def export_check(bols: models.QuerySet, ids: list) -> str:
        status = BolUtils.export_missing_address(bols)
        if status:
            return status

        status = BolUtils.export_missing_cn_date(bols)
        if status:
            return status

        status = BolUtils.export_already(bols)
        if status:
            return status

        status = BolUtils.export_no_mix_bols(bols, ids)
        if status:
            return status

        status = BolUtils.export_no_mix_bols(bols, ids)
        if status:
            return status

        status = BolUtils.export_no_incomplete_order_bols(bols, ids)
        if status:
            return status

        status = BolUtils.export_no_multiple_customer_bols(bols)
        if status:
            return status
        return ""

    @staticmethod
    def get_bols_type(bols: models.QuerySet) -> int:
        from apps.receipt.models import Type
        if bols.filter(order__isnull=True).count() == bols.count():
            return Type.TRANSPORT
        return Type.ORDER

    @staticmethod
    def export_transport_bols(
        bols: models.QuerySet,
        receipt: models.QuerySet,
        customer: models.QuerySet,
        staff: models.QuerySet
    ) -> int:
        from apps.rate.utils import RateUtils
        from apps.transaction.utils import TransactionUtils

        total = 0
        latest_rate = RateUtils.get_latest_rate()
        for bol in bols:
            bol.rate = latest_rate['value']
            bol.real_rate = latest_rate['real_value']
            bol.receipt = receipt
            bol.exported_date = timezone.now()
            bol.save()

            vnd_delivery_fee = BolUtils.cal_delivery_fee(bol).get('delivery_fee', 0)
            if vnd_delivery_fee:
                total = total + vnd_delivery_fee
                TransactionUtils.charge_bol_delivery_fee(vnd_delivery_fee, customer, staff, receipt, bol)

            vnd_sub_fee = int(bol.cny_sub_fee * bol.rate)
            if vnd_sub_fee:
                total = total + vnd_sub_fee
                TransactionUtils.charge_bol_other_sub_fee(vnd_sub_fee, customer, staff, receipt, bol)
        return total

    @staticmethod
    def export_order_bols(
        bols: models.QuerySet,
        receipt: models.QuerySet,
        customer: models.QuerySet,
        staff: models.QuerySet
    ) -> int:
        from apps.order.utils import OrderUtils
        from apps.transaction.utils import TransactionUtils

        total = 0
        for bol in bols:
            bol.receipt = receipt
            bol.exported_date = timezone.now()
            bol.save()
        orders = OrderUtils.get_orders_from_bols(bols)
        for order in orders:
            remain = OrderUtils.get_vnd_total_obj(order) - OrderUtils.get_deposit_amount(order)
            total = total + remain
            TransactionUtils.charge_order_remain(remain, customer, staff, receipt, order)
        return total
