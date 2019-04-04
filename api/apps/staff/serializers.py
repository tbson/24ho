
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from .models import Staff
from apps.group.serializers import GroupBaseSr
from utils.serializers.user import UserRetrieveSr


class StaffBaseSr(ModelSerializer):

    class Meta:
        model = Staff
        fields = [
            'id',
            'is_cust_care',
            'is_sale',
            'is_lock',
            'user',
            'user_data'
        ]
        read_only_fields = ('id',)

    user_data = SerializerMethodField()

    def get_user_data(self, obj):
        return UserRetrieveSr(obj.user).data


class StaffCompactSr(StaffBaseSr):

    class Meta(StaffBaseSr.Meta):
        fields = ('id', 'fullname')
