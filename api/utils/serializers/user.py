from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from rest_framework.validators import UniqueValidator
from rest_framework.serializers import SerializerMethodField
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from utils.helpers.tools import Tools


class UserSr(ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'password',
            'first_name',
            'last_name',
            'fullname'
        ]
        read_only_fields = ('id',)

    password = serializers.CharField(allow_blank=True, allow_null=True)

    email = serializers.CharField(
        validators=[
            UniqueValidator(queryset=User.objects.all(), message='Duplicate email')
        ]
    )
    username = serializers.CharField(
        validators=[
            UniqueValidator(queryset=User.objects.all(), message='Duplicate username')
        ]
    )
    fullname = SerializerMethodField()

    @staticmethod
    def get_fullname(obj):
        return Tools.get_fullname(obj, True)

    def create(self, validated_data):
        instance = User.objects.create_user(**validated_data)

        if 'groups' in self.initial_data:
            groups = []
            for group in self.initial_data.get('groups', []):
                groups.append(int(group))
            if list(groups):
                group_list = Group.objects.filter(id__in=groups)
                for group in group_list:
                    group.user_set.add(instance)

        return instance

    def update(self, instance, validated_data):
        password = validated_data.get('password', None)
        if password is not None and password != '':
            instance.set_password(password)
        validated_data.pop('password', None)

        instance.__dict__.update(validated_data)

        if 'groups' in self.initial_data:
            groups = []
            for group in self.initial_data.get('groups', []):
                groups.append(int(group))

            for group in instance.groups.all():
                group.user_set.remove(instance)

            if list(groups):
                group_list = Group.objects.filter(id__in=groups)
                for group in group_list:
                    group.user_set.add(instance)

        instance.save()
        return instance


class UserRetrieveSr(UserSr):

    class Meta(UserSr.Meta):
        fields = [
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'fullname'
        ]
