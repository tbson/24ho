from django.contrib.auth.models import Group
from django.contrib.auth.models import Permission
from django.db import models
from utils.helpers.test_helpers import TestHelpers
from django.conf import settings


class CustomerUtils:

    @staticmethod
    def seeding(index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import CustomerBaseSr
        from .models import Customer

        if index == 0:
            raise Exception('Indext must be start with 1.')

        def get_data(i: int) -> dict:
            user = TestHelpers.user_seeding(i, True)
            data = {
                "user": user.pk,
                "phone": "00{}".format(i),
            }

            if save is False:
                return data

            try:
                instance = Customer.objects.get(user_id=user.pk)
            except Customer.DoesNotExist:
                instance = CustomerBaseSr(data=data)
                instance.is_valid(raise_exception=True)
                instance = instance.save()
            return instance

        def get_list_data(index):
            return [get_data(i) for i in range(1, index + 1)]

        return get_data(index) if single is True else get_list_data(index)

    @staticmethod
    def ensure_roles(instance: models.QuerySet):
        customerGroup, _ = Group.objects.get_or_create(**{'name': 'Customer'})

        permissions = Permission.objects.filter(codename__in=settings.USER_PERMISSIONS)
        for permission in permissions:
            customerGroup.permissions.add(permission)

        instance.user.groups.add(customerGroup)

    @staticmethod
    def get_list_for_select():
        from .serializers import CustomerSelectSr
        from .models import Customer
        return CustomerSelectSr(Customer.objects.all(), many=True).data
