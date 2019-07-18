import logging
from rest_framework.test import APIClient
from django.test import TestCase
from django.utils import timezone
from .models import Bag
from .serializers import BagBaseSr
from .utils import BagUtils
from utils.helpers.test_helpers import TestHelpers
from apps.area.utils import AreaUtils
from utils.helpers.tools import Tools
# Create your tests here.


class BagTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = BagUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/bag/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/bag/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/bag/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item4 = BagUtils.seeding(4, True, False)

        # Add success
        response = self.client.post(
            '/api/v1/bag/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Bag.objects.count(), 4)

    def test_edit(self):
        item3 = BagUtils.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/bag/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            "/api/v1/bag/{}".format(self.items[0].pk),
            BagBaseSr(self.items[1]).data,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            "/api/v1/bag/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/bag/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Bag.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/bag/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Bag.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/bag/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Bag.objects.count(), 0)


class UtilsGetNextUid(TestCase):
    def setUp(self):
        self.first_part = Tools.get_str_day_month(timezone.now())

    def test_normal_case(self):
        area = AreaUtils.seeding(1, True)

        output = BagUtils.get_next_uid(area)
        eput = "{}{}1".format(area.uid, self.first_part)
        self.assertEqual(output, eput)
        Bag(area=area).save()

        output = BagUtils.get_next_uid(area)
        eput = "{}{}2".format(area.uid, self.first_part)
        self.assertEqual(output, eput)
        Bag(area=area).save()

        area = AreaUtils.seeding(2, True)
        output = BagUtils.get_next_uid(area)
        eput = "{}{}1".format(area.uid, self.first_part)
        self.assertEqual(output, eput)
