from django.db.models import Q
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from .models import Customer
from apps.staff.models import Staff
from utils.serializers.user import UserRetrieveSr


class CustomerBaseSr(ModelSerializer):

    class Meta:
        model = Customer
        fields = [
            'id',
            'avatar',
            'phone',
            'company',
            'cust_care',
            'sale',
            'is_lock',
            'user',
            'user_data'
        ]
        read_only_fields = ('id',)

    user_data = SerializerMethodField()

    def get_user_data(self, obj):
        return UserRetrieveSr(obj.user).data

    def create(self, validated_data):
        instance = Customer.objects.create(**validated_data)

        customerGroup, _ = Group.objects.get_or_create({'name': 'customer'})
        contentTypes = ContentType.objects.filter(model='address')
        contentTypes = [item.pk for item in contentTypes]
        permissions = Permission.objects.filter(content_type_id__in=contentTypes)
        for permission in permissions:
            customerGroup.permissions.add(permission)

        instance.user.groups.add(customerGroup)

        return instance


class CustomerRetrieveSr(CustomerBaseSr):

    sale_name = SerializerMethodField()
    cust_care_name = SerializerMethodField()

    def get_sale_name(self, obj):
        return Staff.objects.getName(obj.sale)

    def get_cust_care_name(self, obj):
        return Staff.objects.getName(obj.cust_care)
