import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Article
from .utils import ArticleUtils
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class ArticleTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = ArticleUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/article/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/article/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/article/".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        # Add success
        item4 = ArticleUtils.seeding(4, True, False)
        resp = self.client.post(
            '/api/v1/article/',
            item4,
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Article.objects.count(), 4)

    def test_edit(self):
        item1 = ArticleUtils.seeding(1, True, False)
        # Update not exist
        resp = self.client.put(
            "/api/v1/article/{}".format(0),
            item1,
            format='json'
        )
        self.assertEqual(resp.status_code, 404)

        # Update success
        resp = self.client.put(
            "/api/v1/article/{}".format(self.items[0].pk),
            item1,
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/article/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Article.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/article/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Article.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/article/?ids={}".format(
                ','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Article.objects.count(), 0)


class UtilsCreateSlug(TestCase):
    def test_normal_case(self):
        title = "Awesome title # 1"
        self.assertEqual(ArticleUtils.create_slug(title), "awesome-title-1")
