import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Bank
from .utils import BankUtils
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class BankTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = BankUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/bank/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/bank/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/bank/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item3 = BankUtils.seeding(3, True, False)
        item4 = BankUtils.seeding(4, True, False)

        # Add duplicate
        response = self.client.post(
            '/api/v1/bank/',
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            '/api/v1/bank/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Bank.objects.count(), 4)

    def test_edit(self):
        item3 = BankUtils.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/bank/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            "/api/v1/bank/{}".format(self.items[0].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            "/api/v1/bank/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/bank/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Bank.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/bank/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Bank.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/bank/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Bank.objects.count(), 0)
