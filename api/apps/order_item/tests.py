import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import OrderItem
from .utils import OrderItemUtils
from .serializers import OrderItemBaseSr
from apps.order.utils import OrderUtils
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class OrderItemTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = OrderItemUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/order-item/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/order-item/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/order-item/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item4 = OrderItemUtils.seeding(4, True, False)

        # Add success
        response = self.client.post(
            '/api/v1/order-item/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(OrderItem.objects.count(), 4)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/order-item/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(OrderItem.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/order-item/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(OrderItem.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/order-item/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(OrderItem.objects.count(), 0)


class PartialUpdates(TestCase):
    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.item = OrderItemUtils.seeding(1, True)

    def test_color(self):
        value = 'new color'

        # Update not exist
        response = self.client.put(
            "/api/v1/order-item/{}/change-color/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order-item/{}/change-color/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['color'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order-item/{}/change-color/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['color'], value)

    def test_size(self):
        value = 'new size'

        # Update not exist
        response = self.client.put(
            "/api/v1/order-item/{}/change-size/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order-item/{}/change-size/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['size'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order-item/{}/change-size/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['size'], value)

    def test_quantity(self):
        value = 99

        # Update not exist
        response = self.client.put(
            "/api/v1/order-item/{}/change-quantity/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order-item/{}/change-quantity/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['quantity'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order-item/{}/change-quantity/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['quantity'], value)

    def test_unit_price(self):
        value = 99.99

        # Update not exist
        response = self.client.put(
            "/api/v1/order-item/{}/change-unit-price/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order-item/{}/change-unit-price/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['unit_price'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order-item/{}/change-unit-price/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['unit_price'], value)

    def test_note(self):
        value = 'new note'

        # Update not exist
        response = self.client.put(
            "/api/v1/order-item/{}/change-note/".format(0),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update normal value
        response = self.client.put(
            "/api/v1/order-item/{}/change-note/".format(self.item.pk),
            {"value": value},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['note'], value)

        # Update missing value -> do nothing
        response = self.client.put(
            "/api/v1/order-item/{}/change-note/".format(self.item.pk),
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['note'], value)


class Serializer(TestCase):
    def test_normal_case(self):
        order = OrderUtils.seeding(1, True)
        data = {
            'order': order.id,
            'title': "title1",
            'url': "url1",
            'shop_link': "shop_link1",
            'shop_nick': "shop_nick1",
            'site': "site1",
            'quantity': 3,
            'unit_price': 50.5
        }
        order_item = OrderItemBaseSr(data=data)
        order_item.is_valid(raise_exception=True)
        order_item.save()
        self.assertEqual(order_item.data['price'], 151.5)
