import logging
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError
from django.test import TestCase
from .models import DeliveryFee, DeliveryFeeUnitPriceType
from .serializers import DeliveryFeeBaseSr
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings
from apps.area.models import Area
# Create your tests here.


class DeliveryFeeTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = DeliveryFee.objects.seeding(3)
        self.area = Area.objects.seeding(1, True)

    def test_list_with_area(self):
        response = self.client.get(
            "/api/v1/delivery-fee/?area={}".format(self.area.id)
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_list_without_area(self):
        response = self.client.get(
            "/api/v1/delivery-fee/".format(self.area.id)
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 0)

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
        self.area = Area.objects.seeding(1, True)
        self.items = DeliveryFee.objects.seeding(3)

    def test_not_matched_mass_range(self):
        self.assertEqual(
            DeliveryFee.objects.get_matched_unit_price(0, self.area.pk, DeliveryFeeUnitPriceType.MASS),
            settings.DEFAULT_DELIVERY_MASS_UNIT_PRICE
        )

    def test_not_matched_mass_area(self):
        self.assertEqual(
            DeliveryFee.objects.get_matched_unit_price(10, 2, DeliveryFeeUnitPriceType.MASS),
            settings.DEFAULT_DELIVERY_MASS_UNIT_PRICE
        )

    def test_not_matched_volume_range(self):
        self.assertEqual(
            DeliveryFee.objects.get_matched_unit_price(0, self.area.pk, DeliveryFeeUnitPriceType.VOLUME),
            settings.DEFAULT_DELIVERY_VOLUME_UNIT_PRICE
        )

    def test_not_matched_volume_area(self):
        self.assertEqual(
            DeliveryFee.objects.get_matched_unit_price(10, 2, DeliveryFeeUnitPriceType.VOLUME),
            settings.DEFAULT_DELIVERY_VOLUME_UNIT_PRICE
        )

    def test_invalid_type(self):
        try:
            DeliveryFee.objects.get_matched_unit_price(10, 3, 99)
            self.assertEqual(1, 0)
        except Exception as err:
            self.assertEqual(str(err), 'Invalid type of delivery fee unit price.')

    def test_matched_lower(self):
        self.assertEqual(
            DeliveryFee.objects.get_matched_unit_price(10, self.area.pk, DeliveryFeeUnitPriceType.MASS),
            200000
        )

    def test_matched_upper(self):
        self.assertEqual(
            DeliveryFee.objects.get_matched_unit_price(19, self.area.pk, DeliveryFeeUnitPriceType.MASS),
            200000
        )

    def test_matched_other_level(self):
        self.assertEqual(
            DeliveryFee.objects.get_matched_unit_price(20, self.area.pk, DeliveryFeeUnitPriceType.MASS),
            100000
        )


class Serializer(TestCase):
    def setUp(self):
        self.area = Area.objects.seeding(1, True)

    def test_start_gt_to(self):
        data = {
            'area': self.area.pk,
            'start': 4,
            'stop': 3,
            'vnd_unit_price': 50,
            'type': 1
        }
        delivery_fee = DeliveryFeeBaseSr(data=data)
        delivery_fee.is_valid(raise_exception=True)
        try:
            delivery_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, DeliveryFeeBaseSr.COMPARE_MESSAGE)

    def test_negative_start(self):
        data = {
            'area': self.area.pk,
            'start': -1,
            'stop': 3,
            'vnd_unit_price': 50,
            'type': 1
        }
        delivery_fee = DeliveryFeeBaseSr(data=data)
        delivery_fee.is_valid(raise_exception=True)
        try:
            delivery_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, DeliveryFeeBaseSr.COMPARE_MESSAGE)

    def test_negative_stop(self):
        data = {
            'area': self.area.pk,
            'start': 3,
            'stop': -1,
            'vnd_unit_price': 50,
            'type': 1
        }
        delivery_fee = DeliveryFeeBaseSr(data=data)
        delivery_fee.is_valid(raise_exception=True)
        try:
            delivery_fee.save()
        except ValidationError as err:
            self.assertEqual(err.detail, DeliveryFeeBaseSr.COMPARE_MESSAGE)
