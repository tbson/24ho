import json
import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Address, AddressService
from .serializers import AddressBaseSr
from apps.area.serializers import AreaBaseSr
from utils.helpers.test_helpers import TestHelpers
from apps.customer.models import Customer
from apps.area.models import Area
# Create your tests here.


class AddressServiceTestCase(TestCase):
    def test_matchUid_first_order(self):
        customerId = 1
        areaCode = 'HN'
        lastUid = ''
        eput = '1HN0'
        output = AddressService.matchUid(customerId, areaCode, lastUid)
        self.assertEqual(eput, output)

    def test_matchUid_normal_case(self):
        customerId = 1
        areaCode = 'HN'
        lastUid = '1HN1'
        eput = '1HN2'
        output = AddressService.matchUid(customerId, areaCode, lastUid)
        self.assertEqual(eput, output)


class AddressManagerTestCase(TestCase):
    def setUp(self):
        logging.disable(logging.CRITICAL)
        self.client = APIClient()

    def test_create(self):
        # Add success
        customer1 = Customer.objects._seeding(1, True)
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + TestHelpers.getCustomerToken(self))

        item1 = Address.objects._seeding(1, True, False)
        resp = self.client.post(
            '/api/v1/address/',
            item1,
            format='json'
        )
        resp = resp.json()
        self.assertEqual(resp['uid'], '1uid10')

        item2 = Address.objects._seeding(2, True, False)
        resp = self.client.post(
            '/api/v1/address/',
            item2,
            format='json'
        )
        resp = resp.json()
        self.assertEqual(resp['uid'], '1uid11')


class AddressTestCase(TestCase):
    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = Address.objects._seeding(3)

    def test_list(self):
        resp = self.client.get(
            '/api/v1/address/'
        )
        self.assertEqual(resp.status_code, 200)
        resp = resp.json()
        self.assertEqual(resp['count'], 3)

    def test_detail(self):
        # Item not exist
        resp = self.client.get(
            "/api/v1/address/{}".format(0)
        )
        self.assertEqual(resp.status_code, 404)

        # Item exist
        resp = self.client.get(
            "/api/v1/address/".format(self.items[0].pk)
        )
        self.assertEqual(resp.status_code, 200)

    def test_create(self):
        # Add success
        item4 = Address.objects._seeding(4, True, False)
        resp = self.client.post(
            '/api/v1/address/',
            item4,
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Address.objects.count(), 4)

    def test_edit(self):
        item1 = Address.objects._seeding(1, True, False)
        # Update not exist
        resp = self.client.put(
            "/api/v1/address/{}".format(0),
            item1,
            format='json'
        )
        self.assertEqual(resp.status_code, 404)

        # Update success
        resp = self.client.put(
            "/api/v1/address/{}".format(self.items[0].pk),
            item1,
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        # Remove not exist
        resp = self.client.delete(
            "/api/v1/address/{}".format(0)
        )
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(Address.objects.count(), 3)

        # Remove single success
        resp = self.client.delete(
            "/api/v1/address/{}".format(self.items[0].pk)
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Address.objects.count(), 2)

        # Remove list success
        resp = self.client.delete(
            "/api/v1/address/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Address.objects.count(), 0)
