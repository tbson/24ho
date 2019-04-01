from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
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
            'cust_care_id',
            'sale_id',
            'is_lock',
            'user',
            'user_data'
        ]
        read_only_fields = ('id',)

    user_data = SerializerMethodField()

    def get_user_data(self, obj):
        return UserRetrieveSr(obj.user).data


class CustomerRetrieveSr(CustomerBaseSr):

    sale_name = SerializerMethodField()
    cust_care_name = SerializerMethodField()

    def get_sale_name(self, obj):
        return Staff.objects.getName(obj.sale_id)

    def get_cust_care_name(self, obj):
        return Staff.objects.getName(obj.cust_care_id)
