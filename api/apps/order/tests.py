import logging
import json
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Order
from .utils import OrderUtils
from .serializers import OrderBaseSr
from apps.address.models import Address
from apps.order_item.models import OrderItem
from apps.order_item.utils import OrderItemUtils
from apps.order_fee.models import OrderFee
from apps.bol.utils import BolUtils
from apps.count_check.models import CountCheck
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings
# Create your tests here.


class OrderTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
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
            "/api/v1/order/".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

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

    def test_edit(self):
        item3 = OrderUtils.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/order/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update success
        response = self.client.put(
            "/api/v1/order/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

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


class ManagerSumCny(TestCase):
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


class ManagerSumVnd(TestCase):
    def test_normal_case(self):
        order = {
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
        }
        self.assertEqual(OrderUtils.sum_vnd(order), 120000)


class ManagerGetVndTotal(TestCase):
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
        }
        self.assertEqual(OrderUtils.get_vnd_Total(order), 526300)


class ManagerCalAmount(TestCase):
    def test_normal_case(self):
        order_items = OrderItemUtils.seeding(3)
        order = order_items[0].order
        self.assertEqual(OrderUtils.cal_amount(order), 77)


class ManagerCalOrderFee(TestCase):
    def test_without_fixed(self):
        order = OrderUtils.seeding(1, True)
        order.cny_amount = 15
        order.save()
        OrderFee.objects.seeding(3)
        self.assertEqual(OrderUtils.cal_order_fee(order), 3)

    def test_with_fixed(self):
        order = OrderUtils.seeding(1, True)
        order.cny_amount = 15
        order.order_fee_factor_fixed = 10
        order.save()
        OrderFee.objects.seeding(3)
        self.assertEqual(OrderUtils.cal_order_fee(order), 1.5)


@patch('apps.bol.utils.BolUtils.cal_delivery_fee', MagicMock(return_value=2))
class ManagerCalDeliveryFee(TestCase):
    def test_normal_case(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.save()
        self.assertEqual(OrderUtils.cal_delivery_fee(order), 6)


class ManagerCalCountCheckFee(TestCase):
    def test_no_manual_input_out_range(self):
        CountCheck.objects.seeding(5)
        orderItems = OrderItemUtils.seeding(5)

        item = orderItems[0].order
        item.count_check_fee_input = 0
        item.save()

        self.assertEqual(OrderUtils.cal_count_check_fee(item), settings.DEFAULT_COUNT_CHECK_PRICE)

    def test_no_manual_input_in_range(self):
        CountCheck.objects.seeding(5)
        orderItems = OrderItemUtils.seeding(15)

        item = orderItems[0].order
        item.count_check_fee_input = 0
        item.save()

        self.assertEqual(OrderUtils.cal_count_check_fee(item), 21)

    def test_manual_input(self):
        CountCheck.objects.seeding(5)
        orderItems = OrderItemUtils.seeding(5)

        item = orderItems[0].order
        item.count_check_fee_input = 5
        item.save()

        self.assertEqual(OrderUtils.cal_count_check_fee(item), 5)


class ManagerCalShockproofFee(TestCase):
    def test_without_register(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.shockproof = False
            bol.cny_shockproof_fee = 2
            bol.save()
        self.assertEqual(OrderUtils.cal_shockproof_fee(order), 0)

    def test_with_register(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.shockproof = True
            bol.cny_shockproof_fee = 2
            bol.save()
        self.assertEqual(OrderUtils.cal_shockproof_fee(order), 6)


class ManagerCalWoodenBoxFee(TestCase):
    def test_without_register(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.wooden_box = False
            bol.cny_wooden_box_fee = 2
            bol.save()
        self.assertEqual(OrderUtils.cal_wooden_box_fee(order), 0)

    def test_with_register(self):
        bols = BolUtils.seeding(3)
        order = OrderUtils.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.wooden_box = True
            bol.cny_wooden_box_fee = 2
            bol.save()
        self.assertEqual(OrderUtils.cal_wooden_box_fee(order), 6)


class Serializer(TestCase):
    def test_normal_case(self):
        address = Address.objects.seeding(1, True)
        data = {
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
        }
        order = OrderBaseSr(data=data)
        order.is_valid(raise_exception=True)
        order.save()
        self.assertEqual(order.data['vnd_total'], 526300)
