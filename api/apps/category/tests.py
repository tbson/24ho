import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Category
from .utils import CategoryUtils
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class CategoryTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = CategoryUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/category/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/category/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/category/".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item3 = CategoryUtils.seeding(3, True, False)
        item4 = CategoryUtils.seeding(4, True, False)
        item5 = CategoryUtils.seeding(5, True, False)
        item6 = CategoryUtils.seeding(6, True, False)

        # Add duplicate
        response = self.client.post(
            '/api/v1/category/',
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            '/api/v1/category/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Category.objects.count(), 4)

        # After add success order increase
        response_1 = self.client.post(
            '/api/v1/category/',
            item5,
            format='json'
        )

        response_1 = response_1.json()

        response_2 = self.client.post(
            '/api/v1/category/',
            item6,
            format='json'
        )

        response_2 = response_2.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_2['order'] - response_1['order'], 1)

    def test_edit(self):
        item3 = CategoryUtils.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/category/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            "/api/v1/category/{}".format(self.items[0].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            "/api/v1/category/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):

        # Remove not exist
        response = self.client.delete(
            "/api/v1/category/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Category.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/category/{}".format(self.items[0].pk)
        )

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Category.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/category/?ids={}".format(','.join(
                [str(self.items[1].pk), str(self.items[2].pk), str(self.items[0].pk), ]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Category.objects.count(), 0)

    def test_add_after_delete(self):
        item4 = CategoryUtils.seeding(4, True, False)

        # Remove single success and create success
        removedOrder = self.items[-1].order
        self.client.delete(
            "/api/v1/category/{}".format(self.items[-1].pk)
        )

        postResponse = self.client.post(
            '/api/v1/category/',
            item4,
            format='json'
        )

        postResponse = postResponse.json()
        self.assertEqual(postResponse['order'], removedOrder)
