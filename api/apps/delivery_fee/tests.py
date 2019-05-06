import logging
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError
from django.test import TestCase
from .models import DeliveryFee
from .serializers import DeliveryFeeBaseSr
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings
# Create your tests here.


class DeliveryFeeTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = DeliveryFee.objects.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/delivery-fee/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/delivery-fee/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/delivery-fee/".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item4 = DeliveryFee.objects.seeding(4, True, False)

        # Add success
        response = self.client.post(
            '/api/v1/delivery-fee/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(DeliveryFee.objects.count(), 4)

    def test_edit(self):
        item3 = DeliveryFee.objects.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/delivery-fee/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update success
        response = self.client.put(
            "/api/v1/delivery-fee/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/delivery-fee/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(DeliveryFee.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/delivery-fee/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(DeliveryFee.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/delivery-fee/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(DeliveryFee.objects.count(), 0)


class ManagerGetMatchedUnitPrice(TestCase):
    def setUp(self):
        self.items = DeliveryFee.objects.seeding(3)

    def test_not_matched(self):
        self.assertEqual(DeliveryFee.objects.getMatchedUnitPrice(0), settings.DEFAULT_DELIVERY_MASS_UNIT_PRICE)

    def test_matched_lower(self):
        self.assertEqual(DeliveryFee.objects.getMatchedUnitPrice(10), 200000)

    def test_matched_upper(self):
        self.assertEqual(DeliveryFee.objects.getMatchedUnitPrice(19), 200000)

    def test_matched_other_level(self):
        self.assertEqual(DeliveryFee.objects.getMatchedUnitPrice(20), 100000)


class Serializer(TestCase):
    def test_from_gt_to(self):
        data = {
            'from_mass': 4,
            'to_mass': 3,
            'fee': 50
        }
        delivery_fee = DeliveryFeeBaseSr(data=data)
        delivery_fee.is_valid(raise_exception=True)
        try:
            delivery_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, DeliveryFeeBaseSr.COMPARE_MESSAGE)

    def test_negative_from(self):
        data = {
            'from_mass': -1,
            'to_mass': 3,
            'fee': 50
        }
        delivery_fee = DeliveryFeeBaseSr(data=data)
        delivery_fee.is_valid(raise_exception=True)
        try:
            delivery_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, DeliveryFeeBaseSr.COMPARE_MESSAGE)

    def test_negative_to(self):
        data = {
            'from_mass': 3,
            'to_mass': -1,
            'fee': 50
        }
        delivery_fee = DeliveryFeeBaseSr(data=data)
        delivery_fee.is_valid(raise_exception=True)
        try:
            delivery_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, DeliveryFeeBaseSr.COMPARE_MESSAGE)
