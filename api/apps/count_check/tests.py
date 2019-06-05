import logging
from rest_framework.test import APIClient
from rest_framework.exceptions import ValidationError
from django.test import TestCase
from .models import CountCheck
from .utils import CountCheckUtils
from .serializers import CountCheckBaseSr
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings
# Create your tests here.


class CountCheckTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = CountCheckUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/count-check/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/count-check/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/count-check/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item4 = CountCheckUtils.seeding(4, True, False)

        # Add success
        response = self.client.post(
            '/api/v1/count-check/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(CountCheck.objects.count(), 4)

    def test_edit(self):
        item3 = CountCheckUtils.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/count-check/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update success
        response = self.client.put(
            "/api/v1/count-check/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/count-check/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(CountCheck.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/count-check/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(CountCheck.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/count-check/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(CountCheck.objects.count(), 0)


class ManagerGetMatchedFee(TestCase):
    def setUp(self):
        self.items = CountCheckUtils.seeding(3)

    def test_not_matched(self):
        self.assertEqual(CountCheckUtils.get_matched_fee(0), settings.DEFAULT_COUNT_CHECK_PRICE)

    def test_matched_lower(self):
        self.assertEqual(CountCheckUtils.get_matched_fee(10), 21)

    def test_matched_upper(self):
        self.assertEqual(CountCheckUtils.get_matched_fee(19), 21)

    def test_matched_other_level(self):
        self.assertEqual(CountCheckUtils.get_matched_fee(20), 22)


class Serializer(TestCase):
    def test_from_gt_to(self):
        data = {
            'from_items': 4,
            'to_items': 3,
            'fee': 50.5
        }
        count_check = CountCheckBaseSr(data=data)
        count_check.is_valid(raise_exception=True)
        try:
            count_check.save()
        except ValidationError as err:
            self.assertEqual(err.detail, CountCheckBaseSr.COMPARE_MESSAGE)

    def test_negative_from(self):
        data = {
            'from_items': -1,
            'to_items': 3,
            'fee': 50.5
        }
        count_check = CountCheckBaseSr(data=data)
        count_check.is_valid(raise_exception=True)
        try:
            count_check.save()
        except ValidationError as err:
            self.assertEqual(err.detail, CountCheckBaseSr.COMPARE_MESSAGE)

    def test_negative_to(self):
        data = {
            'from_items': 3,
            'to_items': -1,
            'fee': 50.5
        }
        count_check = CountCheckBaseSr(data=data)
        count_check.is_valid(raise_exception=True)
        try:
            count_check.save()
        except ValidationError as err:
            self.assertEqual(err.detail, CountCheckBaseSr.COMPARE_MESSAGE)
