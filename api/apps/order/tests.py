import uuid
import logging
import json
from django.utils import timezone
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Order, Status
from .utils import OrderUtils, PushOrderStatusUtils, PullOrderStatusUtils
from .serializers import OrderBaseSr
from apps.address.utils import AddressUtils
from apps.order_item.models import OrderItem
from apps.order_item.utils import OrderItemUtils
from apps.order_fee.utils import OrderFeeUtils
from apps.customer.utils import CustomerUtils
from apps.staff.utils import StaffUtils
from apps.bol.utils import BolUtils
from apps.count_check.utils import CountCheckUtils
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings
# Create your tests here.


class OrderUserGetItemsTestCase(TestCase):

    def setUp(self):
        CustomerUtils.seeding(1, True)

        customer2 = CustomerUtils.seeding(2, True)
        user2 = TestHelpers.user_seeding(2, True)
        customer2.user_id = user2.pk
        customer2.save()

        address2 = AddressUtils.seeding(2, True)
        address2.customer = customer2
        address2.save()

        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + TestHelpers.get_customer_token())

        self.items = OrderUtils.seeding(3)
        self.items[2].address = address2
        self.items[2].save()

    def test_normal_case(self):
        response = self.client.get(
            "/api/v1/order/",
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 2)


class OrderTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = OrderUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/order/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/order/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/order/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_approve_fail(self):
        # Remove list fail
        payload = {
            "ids": [self.items[1].pk, self.items[2].pk, 99]
        }
        response = self.client.put(
            "/api/v1/order/bulk-approve/",
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Order.objects.filter(status=Status.NEW).count(), 3)

    def test_approve_success(self):
        # Remove list success
        payload = {
            "ids": [self.items[1].pk, self.items[2].pk]
        }
        response = self.client.put(
            "/api/v1/order/bulk-approve/",
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Order.objects.filter(status=Status.APPROVED).count(), 2)

    def test_create_fail(self):
        self.assertEqual(Order.objects.count(), 3)
        order = OrderUtils.seeding(4, True, False)
        items = [
            {
                'title': "title1",
                'site': "site1",
                'quantity': 1,
                'unit_price': 50.5
            },
            {
                'title': "title2",
                'url': "url2",
                'site': "site2",
                'quantity': 2,
                'unit_price': 50.5
            },
            {
                'title': "title3",
                'url': "url3",
                'site': "site3",
                'quantity': 3,
                'unit_price': 50.5
            }
        ]
        payload = {
            "order": json.dumps(order),
            "items": json.dumps(items)
        }

        # Add success
        response = self.client.post(
            '/api/v1/order/',
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 3)
        self.assertEqual(OrderItem.objects.count(), 0)

    def test_create_success(self):
        self.assertEqual(Order.objects.count(), 3)
        order = OrderUtils.seeding(4, True, False)
        items = [
            {
                'title': "title1",
                'url': "url1",
                'site': "site1",
                'quantity': 1,
                'unit_price': 50.5,
                'image': 'first thumbnail'
            },
            {
                'title': "title2",
                'url': "url2",
                'site': "site2",
                'quantity': 2,
                'unit_price': 50.5
            },
            {
                'title': "title3",
                'url': "url3",
                'site': "site3",
                'quantity': 3,
                'unit_price': 50.5
            }
        ]
        payload = {
            "order": json.dumps(order),
            "items": json.dumps(items)
        }

        # Add success
        response = self.client.post(
            '/api/v1/order/',
            payload,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['thumbnail'], items[0]['image'])
        self.assertEqual(Order.objects.count(), 4)
        self.assertEqual(OrderItem.objects.count(), len(items))

    def test_delete_fail(self):
        # Remove list fail
        response = self.client.delete(
            "/api/v1/order/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk), '99']))
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Order.objects.count(), 3)

    def test_delete_success(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/order/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Order.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/order/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Order.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/order/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Order.objects.count(), 0)


class PartialUpdates(TestCase):
    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.item = OrderUtils.seeding(1, True)

    def test_sale(self):
        sale = StaffUtils.seeding(1, True)

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-sale/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update exist staff
        response = self.client.put(
            "/api/v1/order/{}/change-sale/".format(self.item.pk),
            {"value": sale.pk},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['sale'], sale.pk)

        # Update not exist staff -> do not change original value
        response = self.client.put(
            "/api/v1/order/{}/change-sale/".format(self.item.pk),
            {"value": 9999},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['sale'], sale.pk)

    def test_cust_care(self):
        cust_care = StaffUtils.seeding(1, True)

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-cust-care/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update exist staff
        response = self.client.put(
            "/api/v1/order/{}/change-cust-care/".format(self.item.pk),
            {"value": cust_care.pk},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['cust_care'], cust_care.pk)

        # Update not exist staff -> do not change original value
        response = self.client.put(
            "/api/v1/order/{}/change-cust-care/".format(self.item.pk),
            {"value": 9999},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['cust_care'], cust_care.pk)

    def test_rate(self):
        value = 3000

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-rate/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order/{}/change-rate/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['rate'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order/{}/change-rate/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['rate'], value)

    def test_address(self):
        address = AddressUtils.seeding(1, True)

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-address/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update exist address
        response = self.client.put(
            "/api/v1/order/{}/change-address/".format(self.item.pk),
            {"value": address.pk},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['address'], address.pk)

        # Update not exist address -> do not change original value
        response = self.client.put(
            "/api/v1/order/{}/change-address/".format(self.item.pk),
            {"value": 9999},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['address'], address.pk)

    def test_count_check_fee_input(self):
        value = 3000

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-count-check-fee-input/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order/{}/change-count-check-fee-input/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count_check_fee_input'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order/{}/change-count-check-fee-input/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count_check_fee_input'], value)

    def test_cny_inland_delivery_fee(self):
        value = 3000

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-cny-inland-delivery-fee/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order/{}/change-cny-inland-delivery-fee/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['cny_inland_delivery_fee'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order/{}/change-cny-inland-delivery-fee/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['cny_inland_delivery_fee'], value)

    def test_order_fee_factor(self):
        value = 30

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-order-fee-factor/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order/{}/change-order-fee-factor/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['order_fee_factor'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order/{}/change-order-fee-factor/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['order_fee_factor'], value)

    def test_purchase_code(self):
        value = 'abcdef'

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-purchase-code/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order/{}/change-purchase-code/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['purchase_code'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order/{}/change-purchase-code/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['purchase_code'], value)

    def test_status(self):
        value = 2

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}/change-status/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order/{}/change-status/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order/{}/change-status/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], value)


class UtilsSumCny(TestCase):
    def test_normal_case(self):
        order = {
            'cny_amount': 100,
            'cny_order_fee': 5,
            'cny_inland_delivery_fee': 5.5,
            'cny_count_check_fee': 3,
            'cny_shockproof_fee': 3,
            'cny_wooden_box_fee': 3,
        }
        self.assertEqual(OrderUtils.sum_cny(order), 119.5)


class UtilsSumVnd(TestCase):
    def test_normal_case(self):
        order = {
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
        }
        self.assertEqual(OrderUtils.sum_vnd(order), 120000)


class UtilsGetVndTotalDiscount(TestCase):
    def test_normal_case(self):
        order = {
            'rate': 3400,
            'cny_count_check_fee_discount': 2.5,
            'cny_order_fee_discount': 2,
            'vnd_delivery_fee_discount': 20000
        }
        self.assertEqual(OrderUtils.get_vnd_total_discount(order), 35300)


class UtilsGetVndTotal(TestCase):
    def test_normal_case(self):
        order = {
            'rate': 3400,
            'cny_amount': 100,
            'cny_order_fee': 5,
            'cny_inland_delivery_fee': 5.5,
            'cny_count_check_fee': 3,
            'cny_shockproof_fee': 3,
            'cny_wooden_box_fee': 3,
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
            'cny_count_check_fee_discount': 2.5,
            'cny_order_fee_discount': 2,
            'vnd_delivery_fee_discount': 20000
        }
        self.assertEqual(OrderUtils.get_vnd_total(order), 491000)


class UtilsCalAmount(TestCase):
    def test_normal_case(self):
        order_items = OrderItemUtils.seeding(3)
        order = order_items[0].order
        self.assertEqual(OrderUtils.cal_amount(order), 77)


class UtilsCalOrderFee(TestCase):
    def test_without_any_order_fee_factor(self):
        order = OrderUtils.seeding(1, True)
        order.cny_amount = 15
        order.order_fee_factor = 0
        order.save()

        order.customer.order_fee_factor = 0
        order.customer.save()

        OrderFeeUtils.seeding(3)
        self.assertEqual(OrderUtils.cal_order_fee(order), 3)

    def test_with_customer_order_fee_factor(self):
        order = OrderUtils.seeding(1, True)
        order.cny_amount = 15
        order.order_fee_factor = 0
        order.save()

        order.customer.order_fee_factor = 20
        order.customer.save()

        OrderFeeUtils.seeding(3)
        self.assertEqual(OrderUtils.cal_order_fee(order), 3)

    def test_with_order_fee_factor(self):
        order = OrderUtils.seeding(1, True)
        order.cny_amount = 15
        order.order_fee_factor = 10
        order.save()

        order.customer.order_fee_factor = 20
        order.customer.save()

        OrderFeeUtils.seeding(3)
        self.assertEqual(OrderUtils.cal_order_fee(order), 1.5)


cal_delivery_fee = {
    'mass_range_unit_price': 1.5,
    'volume_range_unit_price': 3.5,
    'delivery_fee': 2
}
@patch('apps.bol.utils.BolUtils.cal_delivery_fee', MagicMock(return_value=cal_delivery_fee))
class UtilsCalDeliveryFee(TestCase):
    def test_normal_case(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.save()
        self.assertEqual(OrderUtils.cal_delivery_fee(order), 6)


class UtilsCalCountCheckFee(TestCase):
    def test_no_manual_input_out_range(self):
        CountCheckUtils.seeding(5)
        orderItems = OrderItemUtils.seeding(5)

        item = orderItems[0].order
        item.count_check_fee_input = 0
        item.save()

        self.assertEqual(OrderUtils.cal_count_check_fee(item), settings.DEFAULT_COUNT_CHECK_PRICE)

    def test_no_manual_input_in_range(self):
        CountCheckUtils.seeding(5)
        orderItems = OrderItemUtils.seeding(15)

        item = orderItems[0].order
        item.count_check_fee_input = 0
        item.save()

        self.assertEqual(OrderUtils.cal_count_check_fee(item), 21)

    def test_manual_input(self):
        CountCheckUtils.seeding(5)
        orderItems = OrderItemUtils.seeding(5)

        order = orderItems[0].order
        order.count_check_fee_input = 5
        order.save()

        self.assertEqual(OrderUtils.cal_count_check_fee(order), 5)


class UtilsCalShockproofFee(TestCase):
    def test_without_register(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.shockproof = False
            bol.cny_shockproof_fee = 2
            bol.save()
        self.assertEqual(order.cny_shockproof_fee, 0)
        self.assertEqual(OrderUtils.cal_shockproof_fee(order), 0)

    def test_with_register(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.shockproof = True
            bol.cny_shockproof_fee = 2
            bol.save()
        self.assertEqual(order.cny_shockproof_fee, 6)
        self.assertEqual(OrderUtils.cal_shockproof_fee(order), 6)


class UtilsCalWoodenBoxFee(TestCase):
    def test_without_register(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.wooden_box = False
            bol.cny_wooden_box_fee = 2
            bol.save()
        self.assertEqual(order.cny_wooden_box_fee, 0)
        self.assertEqual(OrderUtils.cal_wooden_box_fee(order), 0)

    def test_with_register(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.wooden_box = True
            bol.cny_wooden_box_fee = 2
            bol.save()
        self.assertEqual(order.cny_wooden_box_fee, 6)
        self.assertEqual(OrderUtils.cal_wooden_box_fee(order), 6)


class UtilsCalSubFee(TestCase):
    def test_normal_case(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.cny_sub_fee = 2
            bol.save()
        self.assertEqual(order.cny_sub_fee, 6)
        self.assertEqual(OrderUtils.cal_sub_fee(order), 6)


class UtilsCalStatistics(TestCase):
    def test_normal_case(self):
        order = OrderUtils.seeding(1, True)

        bols = BolUtils.seeding(3)
        for bol in bols:
            bol.order = order
            bol.packages = 1
            bol.save()

        order_items = OrderItemUtils.seeding(3)
        for order_item in order_items:
            order_item.order = order
            order_item.save()

        order_items[1].url = order_items[0].url
        order_items[1].save()

        eput = {
            "links": 2,
            "quantity": 6,
            "packages": 3
        }
        output = OrderUtils.cal_statistics(order)
        self.assertEqual(order.statistics, eput)
        self.assertEqual(output, eput)


class UtilsGetNextUidOrder(TestCase):
    def test_normal_case(self):
        uid = '1HN001A5'
        output = OrderUtils.get_next_uid_order(uid)
        eput = 6
        self.assertEqual(output, eput)

    def test_missing_uid(self):
        uid = ''
        output = OrderUtils.get_next_uid_order(uid)
        eput = 1
        self.assertEqual(output, eput)


class UtilsGetStrDayMonth(TestCase):
    def test_normal_case(self):
        date = timezone.datetime(2019, 9, 17)
        output = OrderUtils.get_str_day_month(date)
        eput = '17I'
        self.assertEqual(output, eput)


class UtilsPrepareNextUid(TestCase):
    def test_normal_case(self):
        address = AddressUtils.seeding(1, True)
        address.uid = '1HN0'
        address.save()

        order = OrderUtils.seeding(1, True)
        order.address = address
        order.uid = '1HN001A5'
        order.save()

        date_now = timezone.now()
        uid, address_code, date = OrderUtils.prepare_next_uid(address)

        self.assertEqual(uid, order.uid)
        self.assertEqual(address_code, address.uid)
        self.assertEqual(date.day, date_now.day)
        self.assertEqual(date.month, date_now.month)


class UtilsGetNextUid(TestCase):
    @patch(
        'apps.order.utils.OrderUtils.prepare_next_uid',
        MagicMock(return_value=('1HN001A5', '1HN0', timezone.datetime(2019, 9, 17)))
    )
    def test_normal_case(self):
        address = AddressUtils.seeding(1, True)
        output = OrderUtils.get_next_uid(address)
        eput = '1HN017I6'
        self.assertEqual(output, eput)


class Serializer(TestCase):
    def test_normal_case(self):
        address = AddressUtils.seeding(1, True)
        customer = CustomerUtils.seeding(2, True)
        data = {
            'uid': str(uuid.uuid4()),
            'address': address.id,
            'shop_link': 'link1',
            'site': 'TAOBAO',
            'real_rate': 3300,

            'rate': 3400,
            'cny_amount': 100,
            'cny_order_fee': 5,
            'cny_inland_delivery_fee': 5.5,
            'cny_count_check_fee': 3,
            'cny_shockproof_fee': 3,
            'cny_wooden_box_fee': 3,
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
            'cny_sub_fee': 12,
        }
        order = OrderBaseSr(data=data)
        order.is_valid(raise_exception=True)
        order_obj = order.save()

        self.assertEqual(order.data['vnd_total'], 567100)
        self.assertEqual(order.data['customer'], address.customer.pk)

        # Update address -> update customer
        address.customer = customer
        address.save()
        order = OrderBaseSr(order_obj, data={'address': address.pk}, partial=True)
        order.is_valid(raise_exception=True)
        order.save()
        self.assertEqual(order.data['customer'], customer.pk)

    def test_blank_names(self):
        address = AddressUtils.seeding(1, True)

        data = {
            'uid': str(uuid.uuid4()),
            'address': address.id,
            'shop_link': 'link1',
            'site': 'TAOBAO',
            'rate': 3400,
            'real_rate': 3300,
        }
        order = OrderBaseSr(data=data)
        order.is_valid(raise_exception=True)
        order.save()

        self.assertEqual(order.data['customer_name'], 'last1 first1')
        self.assertEqual(order.data['sale_name'], '')
        self.assertEqual(order.data['cust_care_name'], '')
        self.assertEqual(order.data['approver_name'], '')

    def test_not_blank_names(self):
        address = AddressUtils.seeding(1, True)
        sale = StaffUtils.seeding(2, True)
        cust_care = StaffUtils.seeding(3, True)
        approver = StaffUtils.seeding(4, True)

        data = {
            'uid': str(uuid.uuid4()),
            'address': address.id,
            'sale': sale.id,
            'cust_care': cust_care.id,
            'approver': approver.id,
            'shop_link': 'link1',
            'site': 'TAOBAO',
            'rate': 3400,
            'real_rate': 3300,
        }
        order = OrderBaseSr(data=data)
        order.is_valid(raise_exception=True)
        order.save()

        self.assertEqual(order.data['customer_name'], 'last1 first1')
        self.assertEqual(order.data['sale_name'], 'last2 first2')
        self.assertEqual(order.data['cust_care_name'], 'last3 first3')
        self.assertEqual(order.data['approver_name'], 'last4 first4')


class StatusFlow(TestCase):
    def setUp(self):
        self.order = OrderUtils.seeding(1, True)
        self.order.status = Status.NEW
        self.order.save()

    def test_normal_flow(self):
        list_push_status = [Status.APPROVED, Status.DEBT, Status.PAID, Status.DISPATCHED,
                            Status.CN_STORE, Status.VN_STORE, Status.EXPORTED, Status.DONE, Status.DISCARD]
        for status in list_push_status:
            PushOrderStatusUtils.move(self.order, status)

        list_pull_status = [Status.DONE, Status.EXPORTED, Status.VN_STORE, Status.CN_STORE,
                            Status.DISPATCHED, Status.PAID, Status.DEBT, Status.APPROVED, Status.NEW]
        for status in list_pull_status:
            PullOrderStatusUtils.move(self.order, status)
