from django.urls import reverse
from django.db.models import Q
from django.db.models import QuerySet
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from utils.serializers.user import UserSr
# from utils.serializers.user import UserSr


class TestHelpers():

    TEST_ADMIN = {
        'username': 'admin',
        'email': 'admin@gmail.com',
        'password': '1234567890',
        'first_name': 'First',
        'last_name': 'Admin'
    }

    TEST_FINGERPRINT = 'test-fingerprint'

    @staticmethod
    def test_setup(self):
        from apps.staff.models import Staff
        # Add original user
        user = User.objects.create_superuser(
            username=TestHelpers.TEST_ADMIN['username'],
            password=TestHelpers.TEST_ADMIN['password'],
            email=''
        )

        # Grand all permission to this user
        permissions = Permission.objects.all()
        user.user_permissions.set(permissions)

        fingerprint = TestHelpers.TEST_FINGERPRINT
        Staff.objects.create(user=user, fingerprint=fingerprint)

        # Test user login and get token
        resp = self.client.post(
            reverse('api_v1:staff:login'),
            {
                'username': TestHelpers.TEST_ADMIN['username'],
                'password': TestHelpers.TEST_ADMIN['password']
            }
        )
        token = resp.json()['user']['token']
        return token

    @staticmethod
    def get_customer_token(self):
        user = TestHelpers.user_seeding(1, True, False)
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
    def user_seeding(index: int, single: bool = False, save: bool = True) -> QuerySet:
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
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

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)
