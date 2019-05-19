import json
import logging
from rest_framework.test import APIClient
from django.test import TestCase
from .models import Staff
from .utils import StaffUtils
from utils.serializers.user import UserSr
from utils.helpers.test_helpers import TestHelpers
# Create your tests here.


class StaffTestCase(TestCase):

    def setUp(self):
        logging.disable(logging.CRITICAL)

        self.token = TestHelpers.test_setup(self)
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION='JWT ' + self.token)

        self.items = StaffUtils.seeding(3)

    def test_list(self):
        resp = self.client.get(
            '/api/v1/staff/'
        )
        self.assertEqual(resp.status_code, 200)
        resp = resp.json()
        self.assertEqual(resp["count"], 4)

    def test_detail(self):
        # Item not exist
        resp = self.client.get(
            "/api/v1/staff/{}".format(0)
        )
        self.assertEqual(resp.status_code, 404)

        # Item exist
        resp = self.client.get(
            "/api/v1/staff/".format(self.items[0].pk)
        )
        self.assertEqual(resp.status_code, 200)

    def test_create(self):
        item3 = TestHelpers.user_seeding(3, True, False)
        item4 = TestHelpers.user_seeding(4, True, False)

        # Add duplicate
        resp = self.client.post(
            '/api/v1/staff/',
            item3,
            format='json'
        )
        self.assertEqual(resp.status_code, 400)

        # Add success
        resp = self.client.post(
            '/api/v1/staff/',
            item4,
            format='json'
        )

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Staff.objects.count(), 5)

    def test_edit(self):
        item2 = TestHelpers.user_seeding(2, True, False)

        # Update not exist
        resp = self.client.put(
            "/api/v1/staff/{}".format(0),
            item2,
            format='json'
        )
        self.assertEqual(resp.status_code, 404)

        # Update duplicate
        resp = self.client.put(
            "/api/v1/staff/{}".format(self.items[0].pk),
            item2,
            format='json'
        )
        self.assertEqual(resp.status_code, 400)

        # Update success
        data = UserSr(self.items[0].user).data
        resp = self.client.put(
            "/api/v1/staff/{}".format(self.items[0].pk),
            data,
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

    def test_delete(self):
        # Remove not exist
        resp = self.client.delete(
            "/api/v1/staff/{}".format(0)
        )
        self.assertEqual(resp.status_code, 404)
        self.assertEqual(Staff.objects.count(), 4)

        # Remove single success
        resp = self.client.delete(
            "/api/v1/staff/{}".format(self.items[0].pk)
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Staff.objects.count(), 3)

        # Remove list success
        resp = self.client.delete(
            "/api/v1/staff/?ids={}".format(','.join([str(self.items[1].pk), str(self.items[2].pk)]))
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Staff.objects.count(), 1)

    def test_profile(self):
        resp = self.client.get(
            "/api/v1/staff/profile/",
            format='json'
        )
        self.assertEqual(resp.status_code, 200)

    def test_updateProfile(self):
        data = TestHelpers.user_seeding(4, True, False)

        resp = self.client.post(
            "/api/v1/staff/profile/",
            data,
            format='json'
        )

        self.assertEqual(resp.status_code, 200)
        result = json.loads(resp.content)

        self.assertEqual(result["user_data"]["username"], data["username"])
        self.assertEqual(result["user_data"]["email"], data["email"])
        self.assertEqual(result["user_data"]["first_name"], data["first_name"])
        self.assertEqual(result["user_data"]["last_name"], data["last_name"])

    def test_changePassword(self):
        data = {
            "oldPassword": TestHelpers.TEST_ADMIN['password'],
            "password": "newpassword"
        }

        resp = self.client.post(
            "/api/v1/staff/change-password/",
            data,
            format='json'
        )

        self.assertEqual(resp.status_code, 200)

        #  Check new password
        resp = self.client.post(
            "/api/v1/staff/auth/",
            {
                'username': TestHelpers.TEST_ADMIN['username'],
                'password': "newpassword"
            },
            format='json'
        )

        self.assertEqual(resp.status_code, 200)

    def test_resetPassword(self):
        #  Reset password
        data = {
            "username": TestHelpers.TEST_ADMIN['username'],
            "password": "newpassword"
        }

        resp = self.client.post(
            "/api/v1/staff/reset-password/",
            data,
            format='json'
        )

        result = json.loads(resp.content)

        self.assertEqual(resp.status_code, 200)

        #  Confirm reset password
        result = json.loads(resp.content)
        token = result["url"].split("/").pop()

        resp = self.client.get(
            "/api/v1/staff/reset-password/",
            {'token': token},
            format='json'
        )

        self.assertEqual(resp.status_code, 200)

        #  Check new password
        resp = self.client.post(
            "/api/v1/staff/auth/",
            {
                'username': TestHelpers.TEST_ADMIN['username'],
                'password': "newpassword"
            },
            format='json'
        )

        self.assertEqual(resp.status_code, 200)

    def test_manager_getListSale(self):
        self.assertEqual(Staff.objects.getListSale().count(), 2)

    def test_manager_getListCustCare(self):
        self.assertEqual(Staff.objects.getListCustCare().count(), 1)

    def test_manager_getName(self):
        self.assertEqual(StaffUtils.getName(self.items[0].pk), UserSr(self.items[0].user).data['fullname'])
        self.assertEqual(StaffUtils.getName(0), "")
