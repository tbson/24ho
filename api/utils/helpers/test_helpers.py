from django.urls import reverse
from django.db.models import Q
from django.db.models import QuerySet
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from django.conf import settings
from utils.serializers.user import UserSr
# from utils.serializers.user import UserSr


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
        resp = self.client.post(
            reverse('api_v1:staff:login'),
            {
                'username': settings.TEST_ADMIN['username'],
                'password': settings.TEST_ADMIN['password']
            }
        )
        token = resp.json()['user']['token']
        return token

    @staticmethod
    def getCustomerToken(self):
        user = TestHelpers.userSeeding(1, True, False)
        resp = self.client.post(
            "/api/v1/customer/auth/",
            {
                'username': user['username'],
                'password': user['password']
            },
            format='json'
        )
        result = resp.json()

        return result['user']['token']

    @staticmethod
    def userSeeding(index: int, single: bool = False, save: bool = True) -> QuerySet:
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            data = {
                "username": "tbson{}".format(i),
                "email": "tbson{}@gmail.com".format(i),
                "password": "123456",
                "first_name": "first{}".format(i),
                "last_name": "last{}".format(i)
            }
            if save is False:
                return data

            try:
                instance = User.objects.get(Q(username=data['username']) | Q(email=data['email']))
            except User.DoesNotExist:
                instance = UserSr(data=data)
                instance.is_valid(raise_exception=True)
                instance = instance.save()
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)
