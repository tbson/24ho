
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from .models import Staff
from apps.group.serializers import GroupBaseSr


class StaffBaseSr(ModelSerializer):

    class Meta:
        read_only_fields = ('id', 'fullname')
        model = Staff
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

    fullname = SerializerMethodField()
    groups = SerializerMethodField()

    def get_fullname(self, obj):
        return "{} {}".format(obj.user.last_name, obj.user.first_name)

    def get_groups(self, obj):
        return GroupBaseSr(obj.user.groups.all(), many=True).data


class StaffCompactSr(StaffBaseSr):

    class Meta(StaffBaseSr.Meta):
        fields = ('id', 'fullname')


class StaffRetrieveSr(StaffBaseSr):

    groups = SerializerMethodField()

    def get_groups(self, obj):
        result = []
        for group in obj.user.groups.all():
            result.append(str(group.id))
        return ','.join(result)


class StaffCreateSr(StaffBaseSr):

    class Meta(StaffBaseSr.Meta):
        extra_kwargs = {
            'user': {'required': False},
        }

    password = serializers.CharField(
        source='user.password',
        allow_blank=True,
        style={'input_type': 'password'}
    )

    def create(self, validated_data):
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

        user = User.objects.create_superuser(
            data.get('username', ''),
            data.get('email', ''),
            data.get('password', ''),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )

        if 'groups' in self.initial_data:
            groups = []
            for group in self.initial_data['groups'].split(','):
                if group.isdigit():
                    groups.append(int(group))
            if len(list(groups)):
                groupList = Group.objects.filter(id__in=groups)
                for group in groupList:
                    group.user_set.add(user)
        data = {
            'user': user,
            'is_lock': validated_data.get('is_lock', False),
            'is_sale': validated_data.get('is_sale', False),
            'is_cust_care': validated_data.get('is_cust_care', False)
        }
        return Staff.objects.create(**data)


class StaffUpdateSr(StaffBaseSr):

    class Meta(StaffBaseSr.Meta):
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

        user.username = user.username if not data.get('username', None) else data['username']
        user.email = user.email if not data.get('email', None) else data['email']
        user.first_name = user.first_name if not data.get('first_name', None) else data['first_name']
        user.last_name = user.last_name if not data.get('last_name', None) else data['last_name']
        user.save()

        if 'groups' in self.initial_data:
            groups = []
            for group in self.initial_data['groups'].split(','):
                if group.isdigit():
                    groups.append(int(group))

            for group in user.groups.all():
                group.user_set.remove(user)

            if len(list(groups)):
                groupList = Group.objects.filter(id__in=groups)
                for group in groupList:
                    group.user_set.add(user)

        instance.user = user
        instance.is_lock = validated_data.get('is_lock', False)
        instance.is_sale = validated_data.get('is_sale', False)
        instance.is_cust_care = validated_data.get('is_cust_care', False)
        instance.save()

        return instance
