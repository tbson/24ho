from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from django.contrib.auth.models import Group


class GroupBaseSr(ModelSerializer):

    class Meta:
        model = Group
        fields = [
            'id',
            'name',
        ]
        read_only_fields = ('id',)

    def create(self, validated_data):
        permissions = []
        permissionSource = self.initial_data.get('permissions', '')
        for permission in permissionSource.split(','):
            if permission.isdigit():
                permissions.append(int(permission))

        group = Group(**validated_data)
        group.save()
        group.permissions.set(permissions)

        return group
