from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from rest_framework.validators import UniqueValidator
from rest_framework.serializers import SerializerMethodField
from django.contrib.auth.models import User


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

    password = serializers.CharField(allow_blank=True)

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

    def get_fullname(self, obj):
        return obj.first_name + ' ' + obj.last_name

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        instance.__dict__.update(validated_data)
        password = validated_data.get('password', None)
        if password is not None:
            instance.set_password(password)
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
