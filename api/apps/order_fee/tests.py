import logging
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError
from django.test import TestCase
from .models import OrderFee
from .utils import OrderFeeUtils
from .serializers import OrderFeeBaseSr
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings
# Create your tests here.


class OrderFeeTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = OrderFeeUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/order-fee/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/order-fee/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/order-fee/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item4 = OrderFeeUtils.seeding(4, True, False)

        # Add success
        response = self.client.post(
            '/api/v1/order-fee/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(OrderFee.objects.count(), 4)

    def test_edit(self):
        item3 = OrderFeeUtils.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/order-fee/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update success
        response = self.client.put(
            "/api/v1/order-fee/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/order-fee/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(OrderFee.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/order-fee/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(OrderFee.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/order-fee/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(OrderFee.objects.count(), 0)


class ManagerGetMatchedFactor(TestCase):
    def setUp(self):
        self.items = OrderFeeUtils.seeding(3)

    def test_not_matched(self):
        self.assertEqual(OrderFeeUtils.get_matched_factor(0), settings.DEFAULT_ORDER_FEE_FACTOR)

    def test_matched_lower(self):
        self.assertEqual(OrderFeeUtils.get_matched_factor(10), 20)

    def test_matched_upper(self):
        self.assertEqual(OrderFeeUtils.get_matched_factor(19), 20)

    def test_matched_other_level(self):
        self.assertEqual(OrderFeeUtils.get_matched_factor(20), 10)


class Serializer(TestCase):
    def test_from_gt_to(self):
        data = {
            'from_amount': 4,
            'to_amount': 3,
            'fee': 50.5
        }
        order_fee = OrderFeeBaseSr(data=data)
        order_fee.is_valid(raise_exception=True)
        try:
            order_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, OrderFeeBaseSr.COMPARE_MESSAGE)

    def test_negative_from(self):
        data = {
            'from_amount': -1,
            'to_amount': 3,
            'fee': 50.5
        }
        order_fee = OrderFeeBaseSr(data=data)
        order_fee.is_valid(raise_exception=True)
        try:
            order_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, OrderFeeBaseSr.COMPARE_MESSAGE)

    def test_negative_to(self):
        data = {
            'from_amount': 3,
            'to_amount': -1,
            'fee': 50.5
        }
        order_fee = OrderFeeBaseSr(data=data)
        order_fee.is_valid(raise_exception=True)
        try:
            order_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, OrderFeeBaseSr.COMPARE_MESSAGE)
