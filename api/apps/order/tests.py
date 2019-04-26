import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Order
from .serializers import OrderBaseSr
from apps.address.models import Address
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class OrderTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = Order.objects._seeding(3)

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

    def test_create(self):
        item4 = Order.objects._seeding(4, True, False)

        # Add success
        response = self.client.post(
            '/api/v1/order/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Order.objects.count(), 4)

    def test_edit(self):
        item3 = Order.objects._seeding(3, True, False)

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

    def test_delete(self):
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

    def test_sumCny(self):
        order = {
            'order_fee_factor': 5,
            'cny_amount': 100,
            'cny_inland_delivery_fee': 5.5,
            'cny_sub_fee': 4,
            'cny_insurance_fee': 3
        }
        self.assertEqual(Order.objects.sumCny(order), 117.5)

    def test_sumVnd(self):
        order = {
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
        }
        self.assertEqual(Order.objects.sumVnd(order), 120000)

    def test_getVndTotal(self):
        order = {
            'rate': 3400,
            'order_fee_factor': 5,
            'cny_amount': 100,
            'cny_inland_delivery_fee': 5.5,
            'cny_sub_fee': 4,
            'cny_insurance_fee': 3,
            'vnd_delivery_fee': 100000,
            'vnd_sub_fee': 20000,
        }
        self.assertEqual(Order.objects.getVndTotal(order), 519500)

    def test_serializer(self):
        address = Address.objects._seeding(1, True)
        data = {
            'address': address.id,
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
