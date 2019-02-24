from django.urls import reverse
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from django.conf import settings


class TestHelpers():

    @staticmethod
    def testSetup(self):
        from apps.administrator.models import Administrator
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
        Administrator.objects.create(user=user, fingerprint=fingerprint)

        # Test user login and get token
        response = self.client.post(
            reverse('api_v1:administrator:login'),
            {
                'username': settings.TEST_ADMIN['username'],
                'password': settings.TEST_ADMIN['password']
            }
        )
        token = response.json()['user']['token']
        return token
