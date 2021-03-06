from django.db import models
from django.utils import timezone
import pyexcel
from apps.address.utils import AddressUtils
from apps.delivery_fee.models import DeliveryFeeUnitPriceType
from apps.delivery_fee.utils import DeliveryFeeUtils
from django.conf import settings
from utils.helpers.tools import Tools
from typing import List, Dict

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
        if item.order:
            if item.order.shockproof:
                return item.cny_shockproof_fee
            return 0
        if item.shockproof:
            return item.cny_shockproof_fee
        return 0

    @staticmethod
    def cal_wooden_box_fee(item: models.QuerySet) -> float:
        if item.order:
            if item.order.wooden_box:
                return item.cny_wooden_box_fee
            return 0
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
    def calculate_transport_bol_fee(bols: models.QuerySet) -> dict:
        result = {}
        for bol in bols:
            result[str(bol.pk)] = {
                'uid': bol.uid,
                'vnd_delivery_fee': bol.vnd_delivery_fee,
                'vnd_insurance_fee': int(bol.cny_insurance_fee * bol.rate),
                'vnd_sub_fee': int((bol.cny_sub_fee + bol.cny_shockproof_fee + bol.cny_wooden_box_fee) * bol.rate)
            }
        return result

    @staticmethod
    def calculate_order_remain(orders: models.QuerySet) -> dict:
        from apps.order.utils import OrderUtils

        result = {}
        for order in orders:
            result[str(order.pk)] = {
                'uid': order.uid,
                'remain': OrderUtils.get_vnd_total_obj(order) - OrderUtils.get_deposit_amount(order),
            }
        return result

    @staticmethod
    def export_transport_bols(
        bols: models.QuerySet,
        receipt: models.QuerySet,
        customer: models.QuerySet,
        staff: models.QuerySet
    ) -> int:
        from apps.transaction.utils import TransactionUtils
        transport_bol_fee = BolUtils.calculate_transport_bol_fee(bols)
        total = 0
        for bol in bols:
            bol.receipt = receipt
            bol.exported_date = timezone.now()
            bol.exporter = staff
            bol.save()

            fee_obj = transport_bol_fee[str(bol.pk)]

            vnd_delivery_fee = fee_obj['vnd_delivery_fee']
            TransactionUtils.charge_bol_delivery_fee(vnd_delivery_fee, customer, staff, receipt, bol)

            vnd_insurance_fee = fee_obj['vnd_insurance_fee']
            TransactionUtils.charge_bol_insurance_fee(vnd_insurance_fee, customer, staff, receipt, bol)

            vnd_sub_fee = fee_obj['vnd_sub_fee']
            TransactionUtils.charge_bol_other_sub_fee(vnd_sub_fee, customer, staff, receipt, bol)

            total = total + vnd_delivery_fee + vnd_insurance_fee + vnd_sub_fee
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
            bol.exporter = staff
            bol.save()
        orders = OrderUtils.get_orders_from_bols(bols)
        order_remain = BolUtils.calculate_order_remain(orders)
        for order in orders:
            remain_obj = order_remain[str(order.pk)]
            remain = remain_obj['remain']
            total = total + remain
            order.receipt = receipt
            order.do_not_check_exported = True
            order.charge_remain = True
            order.save()
            TransactionUtils.charge_order_remain(remain, customer, staff, receipt, order)
        return total

    @staticmethod
    def get_bols_from_receipt(receipt: models.QuerySet) -> list:
        from apps.bol.serializers import BolBaseSr
        bols = receipt.receipt_bols.all()
        return BolBaseSr(bols, many=True).data

    @staticmethod
    def update_order_service(order: models.QuerySet):
        order.order_bols.all().update(
            shockproof=order.shockproof,
            wooden_box=order.wooden_box,
            count_check=order.count_check
        )

    @staticmethod
    def column_to_row(column_dict: Dict, staff: models.QuerySet) -> List[Dict]:
        from apps.address.utils import AddressUtils
        from apps.bag.utils import BagUtils
        from .serializers import BolBaseSr
        from .models import Bol
        result: List = []
        for index in range(len(column_dict['uid'])):
            bag_uid = column_dict['bag_uid'][index]
            uid = column_dict['uid'][index]
            address_code = column_dict['address_code'][index]
            mass = column_dict['mass'][index]
            length = column_dict['length'][index]
            width = column_dict['width'][index]
            height = column_dict['height'][index]
            packages = column_dict['packages'][index]
            count_check = column_dict['count_check'][index]
            cny_shockproof_fee = column_dict['cny_shockproof_fee'][index]
            cny_wooden_box_fee = column_dict['cny_wooden_box_fee'][index]
            note = column_dict['note'][index]

            item = {
                'bag_uid': BagUtils.uid_to_pk(Tools.remove_special_chars(bag_uid, True)),
                'uid': Tools.remove_special_chars(uid, True),
                'address_code': AddressUtils.uid_to_pk(Tools.remove_special_chars(address_code, True)),
                'mass': Tools.string_to_float(mass),
                'length': Tools.string_to_float(length),
                'width': Tools.string_to_float(width),
                'height': Tools.string_to_float(height),
                'packages': Tools.string_to_int(packages),
                'count_check': Tools.string_to_bool(count_check),
                'cny_shockproof_fee': Tools.string_to_float(cny_shockproof_fee),
                'cny_wooden_box_fee': Tools.string_to_float(cny_wooden_box_fee),
                'note': note,
            }
            item['shockproof'] = bool(int(item['cny_shockproof_fee']))
            item['wooden_box'] = bool(int(item['cny_wooden_box_fee']))
            item['cn_date'] = Tools.now()
            item['staff_id'] = staff.pk
            if item['uid']:
                if item['address_code']:
                    item['address'] = item['address_code']
                if item['bag_uid']:
                    item['bag'] = item['bag_uid']
                del item['address_code']
                del item['bag_uid']

                try:
                    bol = Bol.objects.get(uid=item['uid'])
                    del item['uid']
                    print(item)
                    serializer = BolBaseSr(bol, data=item, partial=True)
                except Bol.DoesNotExist:
                    serializer = BolBaseSr(data=item)

                if serializer.is_valid(raise_exception=False):
                    serializer.save()
                    result.append(item)

        return result

    @staticmethod
    def mark_cn_by_uploading(file, staff: models.QuerySet) -> List[Dict]:
        filename = file.name
        extension = filename.split(".")[-1]
        content = file.read()
        sheet = pyexcel.get_sheet(file_type=extension, file_content=content)
        sheet.name_columns_by_row(0)
        obj = dict(sheet.dict)
        return BolUtils.column_to_row(obj, staff)
