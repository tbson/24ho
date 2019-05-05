import logging
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Bol
from utils.helpers.test_helpers import TestHelpers
from apps.delivery_fee.models import DeliveryFee
from apps.customer.models import Customer
from apps.order.models import Order
from django.conf import settings
from utils.helpers.tools import DeliveryFeeType
# Create your tests here.


class BolTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = Bol.objects._seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/bol/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/bol/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/bol/".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item3 = Bol.objects._seeding(3, True, False)
        item4 = Bol.objects._seeding(4, True, False)

        # Add duplicate
        response = self.client.post(
            '/api/v1/bol/',
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            '/api/v1/bol/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Bol.objects.count(), 4)

    def test_edit(self):
        item3 = Bol.objects._seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/bol/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            "/api/v1/bol/{}".format(self.items[0].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            "/api/v1/bol/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/bol/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Bol.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/bol/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Bol.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/bol/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Bol.objects.count(), 0)


class ManagerGetVolume(TestCase):
    def test_normal_case(self):
        item = Bol.objects._seeding(1, True)
        item.length = 100
        item.width = 100
        item.height = 100
        item.save()
        self.assertEqual(Bol.objects.getVolume(item), 1)


class ManagerGetConvertMass(TestCase):
    def test_default_convert_factor(self):
        item = Bol.objects._seeding(1, True)
        item.length = 20
        item.width = 30
        item.height = 10
        item.save()
        self.assertEqual(Bol.objects.getMass(item), 1)

    def test_manual_convert_factor(self):
        item = Bol.objects._seeding(1, True)
        item.mass_convert_factor = 8000
        item.length = 20
        item.width = 20
        item.height = 20
        item.save()
        self.assertEqual(Bol.objects.getMass(item), 1)


class ManagerGetMass(TestCase):
    def test_all_zero(self):
        item = Bol.objects._seeding(1, True)
        self.assertEqual(Bol.objects.getMass(item), 0)

    def test_only_input_mass(self):
        item = Bol.objects._seeding(1, True)
        item.input_mass = 1.5
        item.save()
        self.assertEqual(Bol.objects.getMass(item), 1.5)

    def test_only_convert_mass(self):
        item = Bol.objects._seeding(1, True)
        item.length = 20
        item.width = 30
        item.height = 10
        item.save()
        self.assertEqual(Bol.objects.getMass(item), 1)

    def test_input_mass_bigger(self):
        item = Bol.objects._seeding(1, True)
        item.input_mass = 1.5
        item.length = 20
        item.width = 30
        item.height = 10
        item.save()
        self.assertEqual(Bol.objects.getMass(item), 1.5)

    def test_convert_mass_bigger(self):
        item = Bol.objects._seeding(1, True)
        item.input_mass = 0.5
        item.length = 20
        item.width = 30
        item.height = 10
        item.save()
        self.assertEqual(Bol.objects.getMass(item), 1)


class ManagerCalDeliveryFeeRange(TestCase):
    def test_normal_case(self):
        DeliveryFee.objects._seeding(4)
        item = Bol.objects._seeding(1, True)
        item.input_mass = 20
        item.save()
        deliveryFee = Bol.objects.calDeliveryFeeRange(item)
        self.assertEqual(deliveryFee, 100000)


class ManagerCalDeliveryFeeMass(TestCase):
    def test_only_set_in_customer(self):
        customer = Customer.objects._seeding(1, True)
        customer.delivery_fee_mass_unit_price = 30000
        customer.save()

        item = Bol.objects._seeding(1, True)
        item.customer = customer
        item.input_mass = 20
        item.save()

        deliveryFee = Bol.objects.calDeliveryFeeMass(item)
        self.assertEqual(deliveryFee, 600000)

    def test_set_in_customer_and_bol(self):
        customer = Customer.objects._seeding(1, True)
        customer.delivery_fee_mass_unit_price = 30000
        customer.save()

        item = Bol.objects._seeding(1, True)
        item.customer = customer
        item.input_mass = 20
        item.delivery_fee_mass_unit_price = 40000
        item.save()

        deliveryFee = Bol.objects.calDeliveryFeeMass(item)
        self.assertEqual(deliveryFee, 800000)

    def test_fall_back_to_default_value(self):
        customer = Customer.objects._seeding(1, True)
        customer.delivery_fee_mass_unit_price = 0
        customer.save()

        item = Bol.objects._seeding(1, True)
        item.customer = customer
        item.input_mass = 20
        item.delivery_fee_mass_unit_price = 0
        item.save()

        deliveryFee = Bol.objects.calDeliveryFeeMass(item)
        self.assertEqual(deliveryFee, settings.DEFAULT_DELIVERY_MASS_UNIT_PRICE * item.input_mass)


class ManagerCalDeliveryFeeVolume(TestCase):
    def test_only_set_in_customer(self):
        customer = Customer.objects._seeding(1, True)
        customer.delivery_fee_volume_unit_price = 30000
        customer.save()

        item = Bol.objects._seeding(1, True)
        item.customer = customer
        item.length = 200
        item.width = 200
        item.height = 200
        item.save()

        deliveryFee = Bol.objects.calDeliveryFeeVolume(item)
        self.assertEqual(deliveryFee, 240000)

    def test_set_in_customer_and_bol(self):
        customer = Customer.objects._seeding(1, True)
        customer.delivery_fee_volume_unit_price = 30000
        customer.save()

        item = Bol.objects._seeding(1, True)
        item.customer = customer
        item.length = 200
        item.width = 200
        item.height = 200
        item.delivery_fee_volume_unit_price = 40000
        item.save()

        deliveryFee = Bol.objects.calDeliveryFeeVolume(item)
        self.assertEqual(deliveryFee, 320000)

    def test_fall_back_to_default_value(self):
        customer = Customer.objects._seeding(1, True)
        customer.delivery_fee_volume_unit_price = 0
        customer.save()

        item = Bol.objects._seeding(1, True)
        item.customer = customer
        item.length = 200
        item.width = 200
        item.height = 200
        item.delivery_fee_volume_unit_price = 0
        item.save()

        deliveryFee = Bol.objects.calDeliveryFeeVolume(item)
        self.assertEqual(deliveryFee, settings.DEFAULT_DELIVERY_VOLUME_UNIT_PRICE * 8)


@patch('apps.bol.models.Bol.objects.calDeliveryFeeRange', MagicMock(return_value=1))
@patch('apps.bol.models.Bol.objects.calDeliveryFeeMass', MagicMock(return_value=3))
@patch('apps.bol.models.Bol.objects.calDeliveryFeeVolume', MagicMock(return_value=2))
class ManagerCalDeliveryFee(TestCase):
    def setUp(self):
        self.item = Bol.objects._seeding(1, True)

    def test_max_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.MAX
        self.item.save()

        deliveryFee = Bol.objects.calDeliveryFee(self.item)

        self.assertEqual(deliveryFee, 3)

    def test_range_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.RANGE
        self.item.save()

        deliveryFee = Bol.objects.calDeliveryFee(self.item)

        self.assertEqual(deliveryFee, 1)

    def test_mass_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.MASS
        self.item.save()

        deliveryFee = Bol.objects.calDeliveryFee(self.item)

        self.assertEqual(deliveryFee, 3)

    def test_volume_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.VOLUME
        self.item.save()

        deliveryFee = Bol.objects.calDeliveryFee(self.item)

        self.assertEqual(deliveryFee, 2)


class ManagerCalInsuranceFee(TestCase):
    def test_transport_order_without_register(self):
        item = Bol.objects._seeding(1, True)

        item.insurance_register = False
        item.insurance_value = 50
        item.save()
        self.assertEqual(Bol.objects.calInsuranceFee(item), 0)

    def test_transport_order_with_register(self):
        item = Bol.objects._seeding(1, True)

        item.insurance_register = True
        item.insurance_value = 50
        item.save()
        self.assertEqual(Bol.objects.calInsuranceFee(item), 1.5)

    def test_normal_order_with_register(self):
        item = Bol.objects._seeding(1, True)
        order = Order.objects._seeding(1, True)

        item.order = order
        item.insurance_register = True
        item.insurance_value = 50
        item.save()
        self.assertEqual(Bol.objects.calInsuranceFee(item), 0)
