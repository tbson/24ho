import json
import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Staff
from .serializers import StaffCreateSr
from utils.helpers.test_helpers import TestHelpers
from core import env
# Create your tests here.


class StaffTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.testSetup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        item0 = {
            "username": "tbson0",
            "email": "tbson0@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran",
            "is_sale": True
        }
        item1 = {
            "username": "tbson1",
            "email": "tbson1@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran",
            "is_cust_care": True
        }
        item2 = {
            "username": "tbson2",
            "email": "tbson2@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran"
        }

        self.item0 = StaffCreateSr(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()

        self.item1 = StaffCreateSr(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()

        self.item2 = StaffCreateSr(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()

    def test_list(self):
        response = self.client.get(
            '/api/v1/staff/'
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response["count"], 4)

    def test_detail(self):
        # Item not exist
        response = self.client.get(
            "/api/v1/staff/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)

        # Item exist
        response = self.client.get(
            "/api/v1/staff/".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 200)

    def test_create(self):
        dataSuccess = {
            "username": "tbson3",
            "email": "tbson3@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran"
        }
        dataFail = {
            "username": "tbson2",
            "email": "tbson2@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran"
        }

        # Add duplicate
        response = self.client.post(
            '/api/v1/staff/',
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            '/api/v1/staff/',
            dataSuccess,
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Staff.objects.count(), 5)

    def test_edit(self):
        dataSuccess = {
            "username": "tbson3",
            "email": "tbson3@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran"
        }
        dataFail = {
            "username": "tbson2",
            "email": "tbson2@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran"
        }

        # Update not exist
        response = self.client.put(
            "/api/v1/staff/{}".format(0),
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            "/api/v1/staff/{}".format(self.item1.data['id']),
            dataFail,
            format='json'
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            "/api/v1/staff/{}".format(self.item1.data['id']),
            dataSuccess,
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            "/api/v1/staff/{}".format(0)
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Staff.objects.count(), 4)

        # Remove single success
        response = self.client.delete(
            "/api/v1/staff/{}".format(self.item1.data['id'])
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Staff.objects.count(), 3)

        # Remove list success
        response = self.client.delete(
            "/api/v1/staff/?ids={}".format(','.join([str(self.item0.data['id']), str(self.item2.data['id'])]))
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Staff.objects.count(), 1)

    def test_profile(self):
        response = self.client.get(
            "/api/v1/staff/profile/",
            format='json'
        )
        self.assertEqual(response.status_code, 200)

    def test_updateProfile(self):
        data = {
            "username": "tbson4",
            "email": "tbson4@gmail.com",
            "first_name": "abc",
            "last_name": "def"
        }

        response = self.client.post(
            "/api/v1/staff/profile/",
            data,
            format='json'
        )

        # result = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        '''
        self.assertEqual(result["username"], data["username"])
        self.assertEqual(result["email"], data["email"])
        self.assertEqual(result["first_name"], data["first_name"])
        self.assertEqual(result["last_name"], data["last_name"])
        '''

    def test_changePassword(self):
        data = {
            "oldPassword": env.TEST_ADMIN['password'],
            "password": "newpassword"
        }

        response = self.client.post(
            "/api/v1/staff/change-password/",
            data,
            format='json'
        )

        self.assertEqual(response.status_code, 200)

        #  Check new password
        response = self.client.post(
            "/api/v1/staff/auth/",
            {
                'username': env.TEST_ADMIN['username'],
                'password': "newpassword"
            },
            format='json'
        )

        self.assertEqual(response.status_code, 200)

    def test_resetPassword(self):
        #  Reset password
        data = {
            "username": env.TEST_ADMIN['username'],
            "password": "newpassword"
        }

        response = self.client.post(
            "/api/v1/staff/reset-password/",
            data,
            format='json'
        )

        result = json.loads(response.content)

        self.assertEqual(response.status_code, 200)

        #  Confirm reset password
        result = json.loads(response.content)
        token = result["url"].split("/").pop()

        response = self.client.get(
            "/api/v1/staff/reset-password/",
            {'token': token},
            format='json'
        )

        self.assertEqual(response.status_code, 200)

        #  Check new password
        response = self.client.post(
            "/api/v1/staff/auth/",
            {
                'username': env.TEST_ADMIN['username'],
                'password': "newpassword"
            },
            format='json'
        )

        self.assertEqual(response.status_code, 200)

    def test_manager_getListSale(self):
        self.assertEqual(Staff.objects.getListSale().count(), 1)

    def test_manager_getListCustCare(self):
        self.assertEqual(Staff.objects.getListCustCare().count(), 1)

    def test_manager_getName(self):
        item0 = Staff.objects.filter(user__username="tbson0").first()
        self.assertEqual(Staff.objects.getName(item0.pk), "Tran Son")
        self.assertEqual(Staff.objects.getName(0), "")
