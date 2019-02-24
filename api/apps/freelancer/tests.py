import json
from django.test import TestCase
from django.urls import reverse
from .models import Freelancer
from .serializers import FreelancerCreateSerializer
from utils.helpers.test_helpers import TestHelpers
from core import env
# Create your tests here.


class FreelancerTestCase(TestCase):

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

        self.item0 = FreelancerCreateSerializer(data=item0)
        self.item0.is_valid(raise_exception=True)
        self.item0.save()
        self.item0 = Freelancer.objects.get(user__username=self.item0.data["username"])

        self.item1 = FreelancerCreateSerializer(data=item1)
        self.item1.is_valid(raise_exception=True)
        self.item1.save()
        self.item1 = Freelancer.objects.get(user__username=self.item1.data["username"])

        self.item2 = FreelancerCreateSerializer(data=item2)
        self.item2.is_valid(raise_exception=True)
        self.item2.save()
        self.item2 = Freelancer.objects.get(user__username=self.item2.data["username"])

    def test_list(self):
        response = self.client.get(
            reverse("api_v1:freelancer:list"),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 200)
        response = response.json()
        self.assertEqual(response["count"], 4)

    def test_detail(self):
        # View not exist
        response = self.client.get(
            reverse(
                "api_v1:freelancer:detail",
                kwargs={"pk": 0}
            ),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 404)

        # View success
        response = self.client.get(
            reverse(
                "api_v1:freelancer:detail",
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
            reverse("api_v1:freelancer:create"),
            json.dumps(dataFail),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 400)

        # Add success
        response = self.client.post(
            reverse("api_v1:freelancer:create"),
            json.dumps(dataSuccess),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Freelancer.objects.count(), 5)

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
                "api_v1:freelancer:edit",
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
                "api_v1:freelancer:edit",
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
                "api_v1:freelancer:edit",
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
                "api_v1:freelancer:delete",
                kwargs={
                    "pk": 0
                }
            ),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Freelancer.objects.count(), 4)

        # Remove single success
        response = self.client.delete(
            reverse(
                "api_v1:freelancer:delete",
                kwargs={
                    "pk": self.item1.pk
                }
            ),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Freelancer.objects.count(), 3)

        # Remove list success
        response = self.client.delete(
            reverse(
                "api_v1:freelancer:delete",
                kwargs={
                    "pk": ",".join([str(self.item0.pk), str(self.item2.pk)])
                }
            ),
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Freelancer.objects.count(), 1)

    def test_profile(self):
        response = self.client.get(
            reverse(
                "api_v1:freelancer:profile",
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
                "api_v1:freelancer:profile",
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
                "api_v1:freelancer:changePassword",
            ),
            json.dumps(data),
            content_type="application/json",
            Authorization="JWT " + self.token,
        )
        self.assertEqual(response.status_code, 200)

        #  Check new password
        response = self.client.post(
            reverse('api_v1:freelancer:login'),
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
                "api_v1:freelancer:resetPassword",
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
                "api_v1:freelancer:resetPassword",
            ) + "?token=" + token,
        )
        self.assertEqual(response.status_code, 200)

        #  Check new password
        response = self.client.post(
            reverse('api_v1:freelancer:login'),
            {
                'username': env.TEST_ADMIN['username'],
                'password': "newpassword"
            }
        )
        self.assertEqual(response.status_code, 200)
