import json
import logging
from rest_framework.test import APIClient
from django.test import TestCase
from django.urls import reverse
from .models import Customer
from .serializers import CustomerCreateSr
from utils.helpers.test_helpers import TestHelpers
from core import env
# Create your tests here.


class CustomerTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        item0 = env.TEST_USER

        item1 = {
            "username": "tbson1",
            "email": "tbson1@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran",
            "phone": "000"
        }

        item2 = {
            "username": "tbson2",
            "email": "tbson2@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran",
            "phone": "000"
        }

        self.item0 = CustomerCreateSr(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()

        self.item1 = CustomerCreateSr(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()

        self.item2 = CustomerCreateSr(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()

    def test_list(self):
        response = self.client.get(
            '/api/v1/customer/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response["count"], 3)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/customer/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/customer/".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        dataSuccess = {
            "username": "tbson3",
            "email": "tbson3@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran",
            "phone": "000"
        }
        dataFail = {
            "username": "tbson2",
            "email": "tbson2@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran",
            "phone": "000"
        }

        # Add duplicate
        response = self.client.post(
            '/api/v1/customer/',
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            '/api/v1/customer/',
            dataSuccess,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Customer.objects.count(), 4)

    def test_edit(self):
        dataSuccess = {
            "username": "tbson3",
            "email": "tbson3@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran",
            "phone": "000"
        }
        dataFail = {
            "username": "tbson2",
            "email": "tbson2@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran",
            "phone": "000"
        }

        # Update not exist
        response = self.client.put(
            "/api/v1/customer/{}".format(0),
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            "/api/v1/customer/{}".format(self.item1.data['id']),
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            "/api/v1/customer/{}".format(self.item1.data['id']),
            dataSuccess,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/customer/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Customer.objects.count(), 3)

        # Remove single success
        response = self.client.delete(
            "/api/v1/customer/{}".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Customer.objects.count(), 2)

        # Remove list success
        response = self.client.delete(
            "/api/v1/customer/?ids={}".format(','.join([str(self.item0.data['id']), str(self.item2.data['id'])]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Customer.objects.count(), 0)

    def test_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + TestHelpers.getCustomerToken(self))

        response = self.client.get(
            "/api/v1/customer/profile/",
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_updateProfile(self):
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + TestHelpers.getCustomerToken(self))

        data = {
            "username": "tbson4",
            "email": "tbson4@gmail.com",
            "first_name": "abc",
            "last_name": "def",
            "phone": "000"
        }

        response = self.client.post(
            "/api/v1/customer/profile/",
            data,
            format='json'
        )

        # result = json.loads(response.content)

        self.assertEqual(response.status_code, 200)

        # self.assertEqual(result["username"], data["username"])
        # self.assertEqual(result["email"], data["email"])
        # self.assertEqual(result["first_name"], data["first_name"])
        # self.assertEqual(result["last_name"], data["last_name"])

    def test_changePassword(self):
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + TestHelpers.getCustomerToken(self))

        data = {
            "oldPassword": env.TEST_USER['password'],
            "password": "newpassword"
        }

        response = self.client.post(
            "/api/v1/customer/change-password/",
            data,
            format='json'
        )

        self.assertEqual(response.status_code, 200)

        #  Check new password
        response = self.client.post(
            "/api/v1/customer/auth/",
            {
                'username': env.TEST_USER['username'],
                'password': "newpassword"
            },
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_resetPassword(self):

        #  Reset password
        data = {
            "username": env.TEST_USER['username'],
            "password": "newpassword"
        }

        response = self.client.post(
            "/api/v1/customer/reset-password/",
            data,
            format='json'
        )

        result = json.loads(response.content)

        self.assertEqual(response.status_code, 200)

        #  Confirm reset password
        result = json.loads(response.content)
        token = result["url"].split("/").pop()
        response = self.client.get(
            "/api/v1/customer/reset-password/",
            {'token': token},
            format='json'
        )
        self.assertEqual(response.status_code, 200)

        #  Check new password
        response = self.client.post(
            "/api/v1/customer/auth/",
            {
                'username': env.TEST_USER['username'],
                'password': "newpassword"
            },
            format='json'
        )
        self.assertEqual(response.status_code, 200)
