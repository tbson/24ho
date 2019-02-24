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
        result = [];
        for permission in obj.permissions.all():
            result.append(str(permission.id))
        return ','.join(result)

    def create(self, validated_data):
        permissions = []
        for permission in self.initial_data['permissions'].split(','):
            if permission.isdigit():
                permissions.append(int(permission))

        group = Group(**validated_data)
        group.save();

        if len(list(permissions)):
            group.permissions.set(permissions)
        return group

    def update(self, instance, validated_data):
        permissions = []
        for permission in self.initial_data['permissions'].split(','):
            if permission.isdigit():
                permissions.append(int(permission))

        if len(list(permissions)):
            instance.permissions.clear()
            instance.permissions.set(permissions)

        name = validated_data.get('name', None)
        if name is not None:
            instance.name = name
            instance.save()

        return instance
