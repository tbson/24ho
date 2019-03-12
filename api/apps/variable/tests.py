import json
import logging
from rest_framework.test import APIClient
from django.test import TestCase
from django.urls import reverse
from .models import Variable
from apps.administrator.models import Administrator
from .serializers import VariableBaseSerializer
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class VariableTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        item0 = {
            "uid": "key0",
            "value": "value0",
        }
        item1 = {
            "uid": "key1",
            "value": "value1",
        }
        item2 = {
            "uid": "key2",
            "value": "value2",
        }

        self.item0 = VariableBaseSerializer(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()
        self.item0 = Variable.objects.get(**self.item0.data)

        self.item1 = VariableBaseSerializer(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()
        self.item1 = Variable.objects.get(**self.item1.data)

        self.item2 = VariableBaseSerializer(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()
        self.item2 = Variable.objects.get(**self.item2.data)

    def test_list(self):
        response = self.client.get(
            '/api/v1/variable/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/variable/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/variable/".format(self.item1.pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        dataSuccess = {
            'uid': 'key3',
            'value': 'value3'
        }
        dataFail = {
            'uid': 'key2',
            'value': 'value3'
        }

        # Add duplicate
        response = self.client.post(
            '/api/v1/variable/',
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            '/api/v1/variable/',
            dataSuccess,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Variable.objects.count(), 4)

    def test_edit(self):
        dataSuccess = {
            "uid": "key3",
            "value": "value3"
        }

        dataFail = {
            "uid": "key2",
            "value": "value2"
        }

        # Update not exist
        response = self.client.put(
            "/api/v1/variable/{}".format(0),
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            "/api/v1/variable/{}".format(self.item1.pk),
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            "/api/v1/variable/{}".format(self.item1.pk),
            dataSuccess,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/variable/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Variable.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/variable/{}".format(self.item1.pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Variable.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/variable/?ids={}".format(','.join([str(self.item0.pk), str(self.item2.pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Variable.objects.count(), 0)
