import json
from django.test import TestCase
from django.urls import reverse
from .models import Administrator
from .serializers import AdministratorCreateSerializer
from utils.helpers.test_helpers import TestHelpers
from core import env
# Create your tests here.


class AdministratorTestCase(TestCase):

    def setUp(self):
        self.token = TestHelpers.testSetup(self)

        item0 = {
            "username": "tbson0",
            "email": "tbson0@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran"
        }
        item1 = {
            "username": "tbson1",
            "email": "tbson1@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran"
        }
        item2 = {
            "username": "tbson2",
            "email": "tbson2@gmail.com",
            "password": "123456",
            "first_name": "Son",
            "last_name": "Tran"
        }

        self.item0 = AdministratorCreateSerializer(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()
        self.item0 = Administrator.objects.get(user__username=self.item0.data["username"])

        self.item1 = AdministratorCreateSerializer(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()
        self.item1 = Administrator.objects.get(user__username=self.item1.data["username"])

        self.item2 = AdministratorCreateSerializer(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()
        self.item2 = Administrator.objects.get(user__username=self.item2.data["username"])

    def test_list(self):
        response = self.client.get(
            reverse("api_v1:administrator:list"),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response["count"], 4)

    def test_detail(self):
        # View not exist
        response = self.client.get(
            reverse(
                "api_v1:administrator:detail",
                kwargs={"pk": 0}
            ),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 404)

        # View success
        response = self.client.get(
            reverse(
                "api_v1:administrator:detail",
                kwargs={"pk": self.item1.pk}
            ),
            Authorization="JWT " + self.token,
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
            reverse("api_v1:administrator:create"),
            json.dumps(dataFail),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            reverse("api_v1:administrator:create"),
            json.dumps(dataSuccess),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Administrator.objects.count(), 5)

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
            reverse(
                "api_v1:administrator:edit",
                kwargs={
                    "pk": 0
                }
            ),
            json.dumps(dataFail),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 404)

        # Update duplicate
        response = self.client.put(
            reverse(
                "api_v1:administrator:edit",
                kwargs={
                    "pk": self.item1.pk
                }
            ),
            json.dumps(dataFail),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 400)

        # Update success
        response = self.client.put(
            reverse(
                "api_v1:administrator:edit",
                kwargs={
                    "pk": self.item1.pk
                }
            ),
            json.dumps(dataSuccess),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 200)

    def test_delete(self):
        # Remove not exist
        response = self.client.delete(
            reverse(
                "api_v1:administrator:delete",
                kwargs={
                    "pk": 0
                }
            ),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Administrator.objects.count(), 4)

        # Remove single success
        response = self.client.delete(
            reverse(
                "api_v1:administrator:delete",
                kwargs={
                    "pk": self.item1.pk
                }
            ),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Administrator.objects.count(), 3)

        # Remove list success
        response = self.client.delete(
            reverse(
                "api_v1:administrator:delete",
                kwargs={
                    "pk": ",".join([str(self.item0.pk), str(self.item2.pk)])
                }
            ),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Administrator.objects.count(), 1)


    def test_profile(self):
        response = self.client.get(
            reverse(
                "api_v1:administrator:profile",
            ),
            Authorization="JWT " + self.token,
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
            reverse(
                "api_v1:administrator:profile",
            ),
            json.dumps(data),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        result = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(result["username"], data["username"])
        self.assertEqual(result["email"], data["email"])
        self.assertEqual(result["first_name"], data["first_name"])
        self.assertEqual(result["last_name"], data["last_name"])

    def test_changePassword(self):
        data = {
            "oldPassword": env.TEST_ADMIN['password'],
            "password": "newpassword"
        }
        response = self.client.post(
            reverse(
                "api_v1:administrator:changePassword",
            ),
            json.dumps(data),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 200)

        #  Check new password
        response = self.client.post(
            reverse('api_v1:administrator:login'),
            {
                'username': env.TEST_ADMIN['username'],
                'password': "newpassword"
            }
        )
        self.assertEqual(response.status_code, 200)

    def test_resetPassword(self):
        #  Reset password
        data = {
            "username": env.TEST_ADMIN['username'],
            "password": "newpassword"
        }
        response = self.client.post(
            reverse(
                "api_v1:administrator:resetPassword",
            ),
            json.dumps(data),
            content_type="application/json"
        )
        result = json.loads(response.content)

        self.assertEqual(response.status_code, 200)

        #  Confirm reset password
        result = json.loads(response.content)
        token = result["url"].split("/").pop()
        response = self.client.get(
            reverse(
                "api_v1:administrator:resetPassword",
            ) + "?token=" + token,
        )
        self.assertEqual(response.status_code, 200)

        #  Check new password
        response = self.client.post(
            reverse('api_v1:administrator:login'),
            {
                'username': env.TEST_ADMIN['username'],
                'password': "newpassword"
            }
        )
        self.assertEqual(response.status_code, 200)
