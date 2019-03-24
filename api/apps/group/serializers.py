from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from django.contrib.auth.models import Group


class GroupBaseSerializer(ModelSerializer):

    class Meta:
        model = Group
        fields = [
            'id',
            'name',
            'permissions'
        ]
        read_only_fields = ('id',)

    permissions = SerializerMethodField()

    def get_permissions(self, obj):
        result = []
        for permission in obj.permissions.all():
            result.append(str(permission.id))
        return ','.join(result)

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
