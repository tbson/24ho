import json
import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Customer
from utils.helpers.test_helpers import TestHelpers
from utils.serializers.user import UserSr
# Create your tests here.


class CustomerTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = Customer.objects._seeding(3)

    def test_list(self):
        resp = self.client.get(
            '/api/v1/customer/'
        )
        self.assertEqual(resp.status_code, 200)
        resp = resp.json()
        self.assertEqual(resp["count"], 3)

    def test_detail(self):
        # Item not exist
        resp = self.client.get(
            "/api/v1/customer/{}".format(0)
        )
        self.assertEqual(resp.status_code, 404)

        # Item exist
        resp = self.client.get(
            "/api/v1/customer/".format(self.items[0].pk)
        )
        self.assertEqual(resp.status_code, 200)

    def test_create(self):
        item3 = TestHelpers.userSeeding(3, True, False)
        item4 = TestHelpers.userSeeding(4, True, False)
        item4['phone'] = '000'

        # Add duplicate
        resp = self.client.post(
            '/api/v1/customer/',
            item3,
            format='json'
        )
        self.assertEqual(resp.status_code, 400)

        # Add success
        resp = self.client.post(
            '/api/v1/customer/',
            item4,
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Customer.objects.count(), 4)

    def test_edit(self):
        item2 = TestHelpers.userSeeding(2, True, False)

        # Update not exist
        resp = self.client.put(
            "/api/v1/customer/{}".format(0),
            item2,
            format='json'
        )
        self.assertEqual(resp.status_code, 404)

        # Update duplicate
        resp = self.client.put(
            "/api/v1/customer/{}".format(self.items[0].pk),
            item2,
            format='json'
        )
        self.assertEqual(resp.status_code, 400)

        # Update success
        user = UserSr(self.items[1].user)
        data = {'phone': '000'}
        data.update(user.data)
        resp = self.client.put(
            "/api/v1/customer/{}".format(self.items[1].pk),
            data,
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        # Remove not exist
        resp = self.client.delete(
            "/api/v1/customer/{}".format(0)
        )
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(Customer.objects.count(), 3)

        # Remove single success
        resp = self.client.delete(
            "/api/v1/customer/{}".format(self.items[0].pk)
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Customer.objects.count(), 2)

        # Remove list success
        resp = self.client.delete(
            "/api/v1/customer/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Customer.objects.count(), 0)

    def test_profile(self):
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + TestHelpers.getCustomerToken(self))

        resp = self.client.get(
            "/api/v1/customer/profile/",
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

    def test_updateProfile(self):
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + TestHelpers.getCustomerToken(self))

        data = TestHelpers.userSeeding(4, True, False)
        data['phone'] = '111'

        resp = self.client.post(
            "/api/v1/customer/profile/",
            data,
            format='json'
        )

        self.assertEqual(resp.status_code, 200)
        result = json.loads(resp.content)

        self.assertEqual(result["phone"], data["phone"])
        self.assertEqual(result["user_data"]["username"], data["username"])
        self.assertEqual(result["user_data"]["email"], data["email"])
        self.assertEqual(result["user_data"]["first_name"], data["first_name"])
        self.assertEqual(result["user_data"]["last_name"], data["last_name"])

    def test_changePassword(self):
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + TestHelpers.getCustomerToken(self))
        user = TestHelpers.userSeeding(1, True, False)
        data = {
            "oldPassword": user['password'],
            "password": "newpassword"
        }

        resp = self.client.post(
            "/api/v1/customer/change-password/",
            data,
            format='json'
        )

        self.assertEqual(resp.status_code, 200)

        #  Check new password
        resp = self.client.post(
            "/api/v1/customer/auth/",
            {
                'username': user['username'],
                'password': "newpassword"
            },
            format='json'
        )

        self.assertEqual(resp.status_code, 200)

    def test_resetPassword(self):
        user = TestHelpers.userSeeding(1, True, False)

        #  Reset password
        data = {
            "username": user['username'],
            "password": "newpassword"
        }

        resp = self.client.post(
            "/api/v1/customer/reset-password/",
            data,
            format='json'
        )

        result = json.loads(resp.content)

        self.assertEqual(resp.status_code, 200)

        #  Confirm reset password
        result = json.loads(resp.content)
        token = result["url"].split("/").pop()
        resp = self.client.get(
            "/api/v1/customer/reset-password/",
            {'token': token},
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

        #  Check new password
        resp = self.client.post(
            "/api/v1/customer/auth/",
            {
                'username': user['username'],
                'password': "newpassword"
            },
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
