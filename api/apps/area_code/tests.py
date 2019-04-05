import json
import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import AreaCode
from .serializers import AreaCodeBaseSr
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class AreaCodeTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        item0 = {
            "uid": "key0",
            "title": "title0",
        }
        item1 = {
            "uid": "key1",
            "title": "title1",
        }
        item2 = {
            "uid": "key2",
            "title": "title2",
        }

        self.item0 = AreaCodeBaseSr(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()

        self.item1 = AreaCodeBaseSr(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()

        self.item2 = AreaCodeBaseSr(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()

    def test_list(self):
        response = self.client.get(
            '/api/v1/area-code/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/area-code/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/area-code/".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        dataSuccess = {
            'uid': 'key3',
            'title': 'title3'
        }
        dataFail = {
            'uid': 'key2',
            'title': 'title3'
        }

        # Add duplicate
        response = self.client.post(
            '/api/v1/area-code/',
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            '/api/v1/area-code/',
            dataSuccess,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(AreaCode.objects.count(), 4)

    def test_edit(self):
        dataSuccess = {
            "uid": "key3",
            "title": "title3"
        }

        dataFail = {
            "uid": "key2",
            "title": "title2"
        }

        # Update not exist
        response = self.client.put(
            "/api/v1/area-code/{}".format(0),
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            "/api/v1/area-code/{}".format(self.item1.data['id']),
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            "/api/v1/area-code/{}".format(self.item1.data['id']),
            dataSuccess,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/area-code/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(AreaCode.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/area-code/{}".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(AreaCode.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/area-code/?ids={}".format(','.join([str(self.item0.data['id']), str(self.item2.data['id'])]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(AreaCode.objects.count(), 0)
