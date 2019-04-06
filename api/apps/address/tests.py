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


'''
    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        customer0 = {
            "phone": "000"
        }
        user0 = env.TEST_USER
        user = UserSr(data=user0)
        user.is_valid(raise_exception=True)
        user.save()

        customer0.update({"user": user.data["id"]})
        customer0 = CustomerBaseSr(data=customer0)
        customer0.is_valid(raise_exception=True)
        customer0.save()

        addressCodeData = {
            "uid": "HN",
            "title": "HN"
        }
        addressCode = AreaBaseSr(data=addressCodeData)
        addressCode.is_valid(raise_exception=True)
        addressCode = addressCode.save()

        item0 = {
            "customer_id": customer0.pk,
            "area_id": addressCode.pk,
            "address": "address0",
            "phone": "phone0",
            "fullname": "fullname0",
        }
        item1 = {
            "customer_id": customer0.pk,
            "area_id": addressCode.pk,
            "address": "address1",
            "phone": "phone1",
            "fullname": "fullname1",
        }
        item2 = {
            "customer_id": customer0.pk,
            "area_id": addressCode.pk,
            "address": "address2",
            "phone": "phone2",
            "fullname": "fullname2",
        }

        self.item3 = {
            "customer_id": customer0.pk,
            "area_id": addressCode.pk,
            "address": "address3",
            "phone": "phone3",
            "fullname": "fullname3",
        }

        self.item0 = AddressBaseSr(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()

        self.item1 = AddressBaseSr(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()

        self.item2 = AddressBaseSr(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()

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
            "/api/v1/address/".format(self.item1.data['id'])
        )
        self.assertEqual(resp.status_code, 200)

    def test_create(self):
        # Add success
        resp = self.client.post(
            '/api/v1/address/',
            self.item3,
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Address.objects.count(), 4)

    def test_edit(self):

        # Update not exist
        resp = self.client.put(
            "/api/v1/address/{}".format(0),
            self.item3,
            format='json'
        )
        self.assertEqual(resp.status_code, 404)

        # Update success
        resp = self.client.put(
            "/api/v1/address/{}".format(self.item1.data['id']),
            self.item3,
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
            "/api/v1/address/{}".format(self.item1.data['id'])
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Address.objects.count(), 2)

        # Remove list success
        resp = self.client.delete(
            "/api/v1/address/?ids={}".format(','.join([str(self.item0.data['id']), str(self.item2.data['id'])]))
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Address.objects.count(), 0)
'''
