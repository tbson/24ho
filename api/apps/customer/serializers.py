
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from .models import Customer
from apps.staff.models import Staff


class CustomerBaseSr(ModelSerializer):

    class Meta:
        read_only_fields = ('id', 'fullname')
        model = Customer
        exclude = ()

    username = serializers.CharField(
        source='user.username',
    )
    email = serializers.EmailField(
        source='user.email',
    )

    first_name = serializers.CharField(
        source='user.first_name'
    )
    last_name = serializers.CharField(
        source='user.last_name'
    )

    avatar = serializers.ImageField()

    fullname = SerializerMethodField()

    def get_fullname(self, obj):
        return obj.user.first_name + ' ' + obj.user.last_name


class CustomerRetrieveSr(CustomerBaseSr):

    sale_name = SerializerMethodField()
    cust_care_name = SerializerMethodField()

    def get_sale_name(self, obj):
        return Staff.objects.getName(obj.sale_id)

    def get_cust_care_name(self, obj):
        return Staff.objects.getName(obj.cust_care_id)


class CustomerCreateSr(CustomerBaseSr):

    class Meta(CustomerBaseSr.Meta):
        extra_kwargs = {
            'user': {'required': False},
        }

    password = serializers.CharField(
        source='user.password',
        allow_blank=True,
        style={'input_type': 'password'}
    )

    def create(self, validated_data):
        group, created = Group.objects.get_or_create(name='customer')
        data = validated_data['user']

        # Check duplicate username
        try:
            if data.get('username', None):
                User.objects.get(username=data.get('username'))
                raise serializers.ValidationError({'username': ['Duplicate username']})
        except User.DoesNotExist:
            pass

        # Check duplicate email
        try:
            if data.get('email', None):
                User.objects.get(email=data.get('email'))
                raise serializers.ValidationError({'email': ['Duplicate email']})
        except User.DoesNotExist:
            pass

        user = User.objects.create_user(
            data.get('username', ''),
            data.get('email', ''),
            data.get('password', ''),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        group.user_set.add(user)

        data = {
            'user': user,
            'is_lock': validated_data.get('is_lock', False),
            'phone': validated_data.get('phone', ''),
            'sale_id': validated_data.get('sale_id', None),
            'cust_care_id': validated_data.get('cust_care_id', None)
        }

        return Customer.objects.create(**data)


class CustomerUpdateSr(CustomerBaseSr):

    class Meta(CustomerBaseSr.Meta):
        extra_kwargs = {
            'user': {'required': False},
        }

    def update(self, instance, validated_data):
        user = instance.user
        data = validated_data.get('user', {})

        # Check duplicate username
        try:
            if data.get('username', None):
                User.objects.exclude(pk=user.pk).get(username=data.get('username'))
                raise serializers.ValidationError({'username': ['Duplicate username']})
        except User.DoesNotExist:
            pass

        # Check duplicate email
        try:
            if data.get('email', None):
                User.objects.exclude(pk=user.pk).get(email=data.get('email'))
                raise serializers.ValidationError({'email': ['Duplicate email']})
        except User.DoesNotExist:
            pass

        """
        # No password update here
        if data.get('password', None):
            user.set_password(data.get('password'))
        """

        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.save()

        instance.user = user
        instance.is_lock = validated_data.get('is_lock', False)
        instance.phone = validated_data.get('phone', '')
        instance.sale_id = validated_data.get('sale_id', None)
        instance.cust_care_id = validated_data.get('cust_care_id', None)
        instance.avatar = validated_data.get('avatar', '')
        return instance
