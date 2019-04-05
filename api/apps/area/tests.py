import json
import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Area
from .serializers import AreaBaseSr
from apps.area_code.serializers import AreaCodeBaseSr
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class AreaTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        areaCodeData = {
            "uid": "HN",
            "title": "HN"
        }
        areaCode = AreaCodeBaseSr(data=areaCodeData)
        areaCode.is_valid(raise_exception=True)
        areaCode = areaCode.save()

        item0 = {
            "area_code_id": areaCode.pk,
            "address": "address0",
            "phone": "phone0",
            "fullname": "fullname0",
        }
        item1 = {
            "area_code_id": areaCode.pk,
            "address": "address1",
            "phone": "phone1",
            "fullname": "fullname1",
        }
        item2 = {
            "area_code_id": areaCode.pk,
            "address": "address2",
            "phone": "phone2",
            "fullname": "fullname2",
        }

        self.item3 = {
            "area_code_id": areaCode.pk,
            "address": "address3",
            "phone": "phone3",
            "fullname": "fullname3",
        }

        self.item0 = AreaBaseSr(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()

        self.item1 = AreaBaseSr(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()

        self.item2 = AreaBaseSr(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()

    def test_list(self):
        response = self.client.get(
            '/api/v1/area/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/area/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/area/".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        # Add success
        response = self.client.post(
            '/api/v1/area/',
            self.item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Area.objects.count(), 4)

    def test_edit(self):

        # Update not exist
        response = self.client.put(
            "/api/v1/area/{}".format(0),
            self.item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update success
        response = self.client.put(
            "/api/v1/area/{}".format(self.item1.data['id']),
            self.item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/area/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Area.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/area/{}".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Area.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/area/?ids={}".format(','.join([str(self.item0.data['id']), str(self.item2.data['id'])]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Area.objects.count(), 0)
