import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Transaction, Type, MoneyType
from .utils import TransactionUtils
from utils.helpers.test_helpers import TestHelpers
from apps.order.utils import OrderUtils
from apps.order_item.utils import OrderItemUtils
from apps.staff.utils import StaffUtils
# Create your tests here.


class TransactionTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup()
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = TransactionUtils.seeding(3)

    def test_list(self):
        response = self.client.get(
            '/api/v1/transaction/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response['count'], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/transaction/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/transaction/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        item4 = TransactionUtils.seeding(4, True, False)

        # Add success
        response = self.client.post(
            '/api/v1/transaction/',
            item4,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Transaction.objects.count(), 4)

    def test_edit(self):
        item3 = TransactionUtils.seeding(3, True, False)

        # Update not exist
        response = self.client.put(
            "/api/v1/transaction/{}".format(0),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update success
        response = self.client.put(
            "/api/v1/transaction/{}".format(self.items[2].pk),
            item3,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/transaction/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Transaction.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/transaction/{}".format(self.items[0].pk)
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Transaction.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/transaction/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Transaction.objects.count(), 0)


class UtilApproveOrder(TestCase):

    def test_normal_case(self):
        order = OrderUtils.seeding(1, True)
        order_items = OrderItemUtils.seeding(2)
        for order_item in order_items:
            order_item.order = order
            order_item.save()

        staff = StaffUtils.seeding(1, True)
        TransactionUtils.recharge(100000000, MoneyType.CASH, order.customer, staff, '')
        self.assertEqual(Transaction.objects.count(), 1)

        TransactionUtils.approve_order(order, staff)
        transaction = Transaction.objects.first()

        self.assertEqual(Transaction.objects.count(), 2)
        self.assertEqual(transaction.order, order)
        self.assertEqual(transaction.staff, staff)
        self.assertEqual(transaction.customer, order.customer)
        self.assertEqual(transaction.amount, OrderUtils.get_deposit_amount(order))
        self.assertEqual(transaction.type, Type.DEPOSIT)


class UtilUnapproveOrder(TestCase):

    def test_normal_case(self):
        order = OrderUtils.seeding(1, True)
        staff = StaffUtils.seeding(1, True)

        TransactionUtils.approve_order(order, staff)
        self.assertEqual(Transaction.objects.count(), 1)

        TransactionUtils.unapprove_order(order)
        self.assertEqual(Transaction.objects.count(), 0)
