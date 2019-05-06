import logging
import json
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Order
from .serializers import OrderBaseSr
from apps.address.models import Address
from apps.order_item.models import OrderItem
from apps.order_fee.models import OrderFee
from apps.bol.models import Bol
from apps.count_check.models import CountCheck
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings
# Create your tests here.


class OrderTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = Order.objects.seeding(3)

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
        order = Order.objects.seeding(4, True, False)
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
        order = Order.objects.seeding(4, True, False)
        items = [
            {
                'title': "title1",
                'url': "url1",
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
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Order.objects.count(), 4)
        self.assertEqual(OrderItem.objects.count(), len(items))

    def test_edit(self):
        item3 = Order.objects.seeding(3, True, False)

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
    def test_without_order_fee_factor_fixed(self):
        order = {
            'order_fee_factor': 5,
            'cny_amount': 100,
            'cny_inland_delivery_fee': 5.5,
            'cny_insurance_fee': 3,
            'cny_count_check_fee': 3,
            'cny_shockproof_fee': 3,
            'cny_wooden_box_fee': 3,
            'cny_sub_fee': 4,
        }
        self.assertEqual(Order.objects.sumCny(order), 126.5)

    def test_with_order_fee_factor_fixed(self):
        order = {
            'order_fee_factor': 5,
            'order_fee_factor_fixed': 6,
            'cny_amount': 100,
            'cny_inland_delivery_fee': 5.5,
            'cny_insurance_fee': 3,
            'cny_count_check_fee': 3,
            'cny_shockproof_fee': 3,
            'cny_wooden_box_fee': 3,
            'cny_sub_fee': 4,
        }
        self.assertEqual(Order.objects.sumCny(order), 127.5)


class ManagerSumVnd(TestCase):
    def test_normal_case(self):
        order = {
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
        }
        self.assertEqual(Order.objects.sumVnd(order), 120000)


class ManagerGetVndTotal(TestCase):
    def test_normal_case(self):
        order = {
            'rate': 3400,
            'order_fee_factor': 5,
            'cny_amount': 100,
            'cny_inland_delivery_fee': 5.5,
            'cny_insurance_fee': 3,
            'cny_count_check_fee': 3,
            'cny_shockproof_fee': 3,
            'cny_wooden_box_fee': 3,
            'cny_sub_fee': 4,
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
        }
        self.assertEqual(Order.objects.getVndTotal(order), 550100)


class ManagerCalAmount(TestCase):
    def test_normal_case(self):
        order_items = OrderItem.objects.seeding(3)
        order = order_items[0].order
        self.assertEqual(Order.objects.calAmount(order), 77)


class ManagerCalOrderFee(TestCase):
    def test_normal_case(self):
        amount = 15
        OrderFee.objects.seeding(3)
        self.assertEqual(Order.objects.calOrderFee(amount), 3)


@patch('apps.bol.models.Bol.objects.calDeliveryFee', MagicMock(return_value=2))
class ManagerCalDeliveryFee(TestCase):
    def test_normal_case(self):
        bols = Bol.objects.seeding(3)
        order = Order.objects.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.save()
        self.assertEqual(Order.objects.calDeliveryFee(order), 6)


@patch('apps.bol.models.Bol.objects.calInsuranceFee', MagicMock(return_value=2))
class ManagerCalInsuranceFee(TestCase):
    def test_normal_case(self):
        bols = Bol.objects.seeding(3)
        order = Order.objects.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.save()
        self.assertEqual(Order.objects.calInsuranceFee(order), 6)


class ManagerCalCountCheckFee(TestCase):
    def test_no_manual_input_out_range(self):
        CountCheck.objects.seeding(5)
        orderItems = OrderItem.objects.seeding(5)

        item = orderItems[0].order
        item.count_check_fee_input = 0
        item.save()

        self.assertEqual(Order.objects.calCountCheckFee(item), settings.DEFAULT_COUNT_CHECK_PRICE)

    def test_no_manual_input_in_range(self):
        CountCheck.objects.seeding(5)
        orderItems = OrderItem.objects.seeding(15)

        item = orderItems[0].order
        item.count_check_fee_input = 0
        item.save()

        self.assertEqual(Order.objects.calCountCheckFee(item), 21)

    def test_manual_input(self):
        CountCheck.objects.seeding(5)
        orderItems = OrderItem.objects.seeding(5)

        item = orderItems[0].order
        item.count_check_fee_input = 5
        item.save()

        self.assertEqual(Order.objects.calCountCheckFee(item), 5)


class ManagerCalShockproofFee(TestCase):
    def test_without_register(self):
        bols = Bol.objects.seeding(3)
        order = Order.objects.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.shockproof = False
            bol.cny_shockproof_fee = 2
            bol.save()
        self.assertEqual(Order.objects.calShockproofFee(order), 0)

    def test_with_register(self):
        bols = Bol.objects.seeding(3)
        order = Order.objects.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.shockproof = True
            bol.cny_shockproof_fee = 2
            bol.save()
        self.assertEqual(Order.objects.calShockproofFee(order), 6)


class ManagerCalWoodenBoxFee(TestCase):
    def test_without_register(self):
        bols = Bol.objects.seeding(3)
        order = Order.objects.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.wooden_box = False
            bol.cny_wooden_box_fee = 2
            bol.save()
        self.assertEqual(Order.objects.calWoodenBoxFee(order), 0)

    def test_with_register(self):
        bols = Bol.objects.seeding(3)
        order = Order.objects.seeding(1, True)
        for bol in bols:
            bol.order = order
            bol.wooden_box = True
            bol.cny_wooden_box_fee = 2
            bol.save()
        self.assertEqual(Order.objects.calWoodenBoxFee(order), 6)


class ManagerCalSubFee(TestCase):
    def test_normal_normal(self):
        bols = Bol.objects.seeding(3)
        order = Order.objects.seeding(1, True)
        for bol in bols:
            bol.cny_sub_fee = 2
            bol.save()
        self.assertEqual(Order.objects.calSubFee(order), 0)


class Serializer(TestCase):
    def test_normal_case(self):
        address = Address.objects.seeding(1, True)
        data = {
            'address': address.id,
            'shop_link': 'link1',
            'site': 'TAOBAO',
            'rate': 3400,
            'real_rate': 3400,
            'order_fee_factor': 5,
            'cny_amount': 100,
            'cny_inland_delivery_fee': 5.5,
            'cny_sub_fee': 4,
            'cny_insurance_fee': 3,
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
        }
        order = OrderBaseSr(data=data)
        order.is_valid(raise_exception=True)
        order.save()
        self.assertEqual(order.data['vnd_total'], 519500)
