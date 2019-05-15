import logging
from django.utils import timezone
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Rate
from apps.variable.models import Variable
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings
# Create your tests here.


class RateTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = Rate.objects.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/rate/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/rate/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/rate/".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item4 = Rate.objects.seeding(4, True, False)

        # Add success
        response = self.client.post(
            '/api/v1/rate/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Rate.objects.count(), 4)

    def test_edit(self):
        item3 = Rate.objects.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/rate/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update success
        response = self.client.put(
            "/api/v1/rate/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/rate/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Rate.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/rate/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Rate.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/rate/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Rate.objects.count(), 0)

    def test_duplicate(self):
        Rate.objects.all().delete()

        # Duplicate when there is no record
        item = Rate.objects.duplicate()
        self.assertEqual(item, None)

        # Duplicate when there are some records
        self.items = Rate.objects.seeding(1)
        self.items[0].created_at = timezone.now() - timezone.timedelta(days=1)
        self.items[0].save()

        item = Rate.objects.duplicate()
        self.assertIsInstance(item, Rate)
        self.assertTrue(item.created_at > self.items[0].created_at + timezone.timedelta(days=1))

        # Duplicate same date
        item = Rate.objects.duplicate()
        self.assertEqual(item, None)

    def test_exposed(self):
        Variable.objects.all().delete()
        Rate.objects.all().delete()

        # Get default rate
        response = self.client.get(
            "/api/v1/rate/latest"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['value'], settings.DEFAULT_RATE)

        # Get rate from variables
        Variable.objects.create(uid='rate', value=1234)
        response = self.client.get(
            "/api/v1/rate/latest"
        )
        self.assertEqual(response.data['value'], 1234)

        # Get latest rate
        latest_rate = Rate.objects.seeding(1, True)
        response = self.client.get(
            "/api/v1/rate/latest"
        )
        self.assertEqual(response.data['value'], latest_rate.order_rate)
