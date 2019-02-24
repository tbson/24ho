from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from django.contrib.auth.models import Permission


class PermissionBaseSerializer(ModelSerializer):

    content_type = SerializerMethodField()

    class Meta:
        model = Permission
        fields = [
            'id',
            'content_type',
            'codename',
            'name'
        ]
        read_only_fields = ('id', 'content_type')

    def get_content_type(self, obj):
        return obj.content_type.app_label
