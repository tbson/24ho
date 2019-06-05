import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .serializers import GroupBaseSr
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class GroupTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        item0 = {
            "name": "group0",
        }
        item1 = {
            "name": "group1",
        }
        item2 = {
            "name": "group2",
        }

        self.item0 = GroupBaseSr(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()

        self.item1 = GroupBaseSr(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()

        self.item2 = GroupBaseSr(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()

    def test_list(self):
        response = self.client.get(
            '/api/v1/group/'
        )
        self.assertEqual(response.status_code, 200)

    def test_detail(self):
        # View not exist
        response = self.client.get(
            "/api/v1/group/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # View success
        response = self.client.get(
            "/api/v1/group/{}".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 200)
