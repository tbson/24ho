import logging
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from django.test import TestCase
from django.utils import timezone
from .models import Bol, DeliveryFeeType
from .utils import BolUtils
from utils.helpers.test_helpers import TestHelpers
from apps.delivery_fee.utils import DeliveryFeeUtils
from apps.customer.utils import CustomerUtils
from apps.order.utils import OrderUtils
from apps.address.utils import AddressUtils
from django.conf import settings
# Create your tests here.


model_prefix = 'apps.bol.utils.BolUtils.{}'


class BolTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = BolUtils.seeding(3)

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
        item3 = BolUtils.seeding(3, True, False)
        item4 = BolUtils.seeding(4, True, False)

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
        item3 = BolUtils.seeding(3, True, False)

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
        item = BolUtils.seeding(1, True)
        item.length = 100
        item.width = 100
        item.height = 100
        item.save()
        self.assertEqual(BolUtils.get_volume(item), 1)


class ManagerGetMassConvert(TestCase):
    def test_default_convert_factor(self):
        item = BolUtils.seeding(1, True)
        item.length = 20
        item.width = 30
        item.height = 10
        item.save()
        self.assertEqual(BolUtils.get_mass_convert(item), 1)

    def test_manual_convert_factor(self):
        item = BolUtils.seeding(1, True)
        item.mass_convert_factor = 8000
        item.length = 20
        item.width = 20
        item.height = 20
        item.save()
        self.assertEqual(BolUtils.get_mass_convert(item), 1)


class ManagerGetMass(TestCase):

    def test_normal_case(self):
        item = BolUtils.seeding(1, True)
        item.input_mass = 1.5
        item.save()
        self.assertEqual(BolUtils.get_mass(item), 1.5)


class ManagerCalDeliveryFeeRange(TestCase):
    def test_normal_case(self):
        DeliveryFeeUtils.seeding(4)
        item = BolUtils.seeding(1, True)
        item.input_mass = 20
        item.save()
        output = BolUtils.cal_delivery_fee_range(item)
        eput = {
            'MASS': 100000,
            'VOLUME': settings.DEFAULT_DELIVERY_VOLUME_UNIT_PRICE
        }
        self.assertEqual(output, eput)


@patch(model_prefix.format('cal_delivery_fee_range'), MagicMock(return_value={'MASS': 1.5, 'VOLUME': 2.5}))
class ManagerCalDeliveryFeeMassUnitPrice(TestCase):
    def test_only_set_in_customer(self):
        customer = CustomerUtils.seeding(1, True)
        customer.delivery_fee_mass_unit_price = 30000
        customer.save()

        item = BolUtils.seeding(1, True)
        item.customer = customer
        item.save()

        output = BolUtils.cal_delivery_fee_mass_unit_price(item)
        eput = {
            'RANGE': 1.5,
            'FIXED': 30000
        }
        self.assertEqual(output, eput)

    def test_set_in_customer_and_bol(self):
        customer = CustomerUtils.seeding(1, True)
        customer.delivery_fee_mass_unit_price = 30000
        customer.save()

        item = BolUtils.seeding(1, True)
        item.customer = customer
        item.mass_unit_price = 40000
        item.save()

        output = BolUtils.cal_delivery_fee_mass_unit_price(item)
        eput = {
            'RANGE': 1.5,
            'FIXED': 40000
        }
        self.assertEqual(output, eput)

    def test_fall_back_to_default_value(self):
        customer = CustomerUtils.seeding(1, True)
        customer.delivery_fee_mass_unit_price = 0
        customer.save()

        item = BolUtils.seeding(1, True)
        item.customer = customer
        item.input_mass = 20
        item.mass_unit_price = 0
        item.save()

        output = BolUtils.cal_delivery_fee_mass_unit_price(item)
        eput = {
            'RANGE': 1.5,
            'FIXED': 0
        }
        self.assertEqual(output, eput)


@patch(model_prefix.format('cal_delivery_fee_range'), MagicMock(return_value={'MASS': 1.5, 'VOLUME': 2.5}))
class ManagerCalDeliveryFeeVolumeUnitPrice(TestCase):
    def test_only_set_in_customer(self):
        customer = CustomerUtils.seeding(1, True)
        customer.delivery_fee_volume_unit_price = 30000
        customer.save()

        item = BolUtils.seeding(1, True)
        item.customer = customer
        item.save()

        output = BolUtils.cal_delivery_fee_volume_unit_price(item)
        eput = {
            'RANGE': 2.5,
            'FIXED': 30000
        }
        self.assertEqual(output, eput)

    def test_set_in_customer_and_bol(self):
        customer = CustomerUtils.seeding(1, True)
        customer.delivery_fee_volume_unit_price = 30000
        customer.save()

        item = BolUtils.seeding(1, True)
        item.customer = customer
        item.volume_unit_price = 40000
        item.save()

        output = BolUtils.cal_delivery_fee_volume_unit_price(item)
        eput = {
            'RANGE': 2.5,
            'FIXED': 40000
        }
        self.assertEqual(output, eput)

    def test_fall_back_to_default_value(self):
        customer = CustomerUtils.seeding(1, True)
        customer.delivery_fee_volume_unit_price = 0
        customer.save()

        item = BolUtils.seeding(1, True)
        item.customer = customer
        item.input_volume = 20
        item.volume_unit_price = 0
        item.save()

        output = BolUtils.cal_delivery_fee_volume_unit_price(item)
        eput = {
            'RANGE': 2.5,
            'FIXED': 0
        }
        self.assertEqual(output, eput)


@patch(model_prefix.format('get_mass'), MagicMock(return_value=1.5))
@patch(model_prefix.format('get_mass_convert'), MagicMock(return_value=2.5))
@patch(model_prefix.format('get_volume'), MagicMock(return_value=3.5))
@patch(model_prefix.format('cal_delivery_fee_mass_unit_price'), MagicMock(return_value={'RANGE': 1.5, 'FIXED': 2.5}))
@patch(model_prefix.format('cal_delivery_fee_volume_unit_price'), MagicMock(return_value={'RANGE': 3.5, 'FIXED': 4.5}))
class ManagerCalDeliveryFee(TestCase):
    def setUp(self):
        self.item = BolUtils.seeding(1, True)

    def test_blank_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.BLANK
        self.item.save()
        output = BolUtils.cal_delivery_fee(self.item)
        eput = {
            'mass_range_unit_price': 1.5,
            'volume_range_unit_price': 3.5,
            'delivery_fee': 15.75
        }
        self.assertEqual(output, eput)

    def test_max_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.MAX
        self.item.save()
        output = BolUtils.cal_delivery_fee(self.item)
        eput = {
            'mass_range_unit_price': 1.5,
            'volume_range_unit_price': 3.5,
            'delivery_fee': 15.75
        }
        self.assertEqual(output, eput)

    def test_mass_range_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.MASS_RANGE
        self.item.save()
        output = BolUtils.cal_delivery_fee(self.item)
        eput = {
            'mass_range_unit_price': 1.5,
            'volume_range_unit_price': 3.5,
            'delivery_fee': 2.25
        }
        self.assertEqual(output, eput)

    def test_mass_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.MASS
        self.item.save()
        output = BolUtils.cal_delivery_fee(self.item)
        eput = {
            'mass_range_unit_price': 1.5,
            'volume_range_unit_price': 3.5,
            'delivery_fee': 3.75
        }
        self.assertEqual(output, eput)

    def test_mass_convert_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.MASS_CONVERT
        self.item.save()
        output = BolUtils.cal_delivery_fee(self.item)
        eput = {
            'mass_range_unit_price': 1.5,
            'volume_range_unit_price': 3.5,
            'delivery_fee': 6.25
        }
        self.assertEqual(output, eput)

    def test_volume_range_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.VOLUME_RANGE
        self.item.save()
        output = BolUtils.cal_delivery_fee(self.item)
        eput = {
            'mass_range_unit_price': 1.5,
            'volume_range_unit_price': 3.5,
            'delivery_fee': 12.25
        }
        self.assertEqual(output, eput)

    def test_volume_type(self):
        self.item.delivery_fee_type = DeliveryFeeType.VOLUME
        self.item.save()
        output = BolUtils.cal_delivery_fee(self.item)
        eput = {
            'mass_range_unit_price': 1.5,
            'volume_range_unit_price': 3.5,
            'delivery_fee': 15.75
        }
        self.assertEqual(output, eput)


class ModelCreate(TestCase):
    def setUp(self):
        self.address = AddressUtils.seeding(1, True)
        self.address_1 = AddressUtils.seeding(2, True)

    """ update address_code """

    def test_only_address(self):
        item = Bol.objects.create(uid='test', address=self.address)

        self.assertEqual(item.address_code, self.address.uid)

    """ update address """

    def test_only_address_code_match(self):
        item = Bol.objects.create(uid='test', address_code=self.address.uid)
        self.assertEqual(item.address, self.address)

    """ do nothing """

    def test_only_address_code_miss(self):
        item = Bol.objects.create(uid='test', address_code='miss')
        self.assertEqual(item.address_id, None)

    """ take address """

    def test_both(self):
        item = Bol.objects.create(uid='test', address=self.address, address_code=self.address_1.uid)

        self.assertEqual(item.address, self.address)
        self.assertEqual(item.address_code, self.address.uid)


class ManagerCalInsuranceFee(TestCase):
    def test_transport_order_without_register(self):
        item = BolUtils.seeding(1, True)

        item.insurance = False
        item.cny_insurance_value = 50
        item.save()
        self.assertEqual(BolUtils.cal_insurance_fee(item), 0)

    def test_transport_order_with_register(self):
        item = BolUtils.seeding(1, True)

        item.insurance = True
        item.cny_insurance_value = 50
        item.save()
        self.assertEqual(BolUtils.cal_insurance_fee(item), 1.5)

    def test_normal_order_with_register(self):
        item = BolUtils.seeding(1, True)
        order = OrderUtils.seeding(1, True)

        item.order = order
        item.insurance = True
        item.cny_insurance_value = 50
        item.save()
        self.assertEqual(BolUtils.cal_insurance_fee(item), 0)


class ManagerShockproofFee(TestCase):
    def test_without_register(self):
        item = BolUtils.seeding(1, True)

        item.shockproof = False
        item.cny_shockproof_fee = 1000
        item.save()
        self.assertEqual(BolUtils.cal_shockproof_fee(item), 0)

    def test_with_register(self):
        item = BolUtils.seeding(1, True)

        item.shockproof = True
        item.cny_shockproof_fee = 1000
        item.save()
        self.assertEqual(BolUtils.cal_shockproof_fee(item), 1000)


class ManagerWoodenBoxFee(TestCase):
    def test_without_register(self):
        item = BolUtils.seeding(1, True)

        item.wooden_box = False
        item.cny_wooden_box_fee = 1000
        item.save()
        self.assertEqual(BolUtils.cal_wooden_box_fee(item), 0)

    def test_with_register(self):
        item = BolUtils.seeding(1, True)

        item.wooden_box = True
        item.cny_wooden_box_fee = 1000
        item.save()
        self.assertEqual(BolUtils.cal_wooden_box_fee(item), 1000)


class ManagerReCal(TestCase):
    @patch(model_prefix.format('cal_delivery_fee'))
    def test_before_export(self, cal_delivery_fee):
        item = BolUtils.seeding(1, True)
        item.save()
        Bol.objects.re_cal(item)
        cal_delivery_fee.assert_called_once()

    @patch(model_prefix.format('cal_delivery_fee'))
    def test_after_export(self, cal_delivery_fee):
        item = BolUtils.seeding(1, True)
        item.exported_date = timezone.now()
        item.save()
        Bol.objects.re_cal(item)
        cal_delivery_fee.assert_not_called()
