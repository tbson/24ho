from django.urls import reverse
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from django.conf import settings
from core import env


class TestHelpers():

    @staticmethod
    def testSetup(self):
        from apps.staff.models import Staff
        # Add original user
        user = User.objects.create_superuser(
            username=settings.TEST_ADMIN['username'],
            password=settings.TEST_ADMIN['password'],
            email=''
        )

        # Grand all permission to this user
        permissions = Permission.objects.all()
        user.user_permissions.set(permissions)

        fingerprint = settings.TEST_FINGERPRINT
        Staff.objects.create(user=user, fingerprint=fingerprint)

        # Test user login and get token
        response = self.client.post(
            reverse('api_v1:staff:login'),
            {
                'username': settings.TEST_ADMIN['username'],
                'password': settings.TEST_ADMIN['password']
            }
        )
        token = response.json()['user']['token']
        return token

    @staticmethod
    def getCustomerToken(self):
        response = self.client.post(
            "/api/v1/customer/auth/",
            {
                'username': env.TEST_USER['username'],
                'password': env.TEST_USER['password']
            },
            format='json'
        )
        return response.json()['user']['token']
