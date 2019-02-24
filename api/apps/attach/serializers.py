from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import ValidationError
from rest_framework.serializers import SerializerMethodField
from utils.helpers.tools import Tools
from .models import Attach


class AttachBaseSerializer(ModelSerializer):

    class Meta:
        model = Attach
        exclude = ()
        read_only_fields = ('id',)
        extra_kwargs = {
            'title': {'required': False},
        }

class AttachCreateSerializer(AttachBaseSerializer):

    def create(self, validated_data):
        validated_data['filetype'] = Tools.checkMime(validated_data['attachment'])
        if validated_data['filetype'] == '':
            raise ValidationError({'detail': 'File type not supported'})
        attach = Attach(**validated_data)
        attach.save()
        return attach

class AttachUpdateSerializer(AttachBaseSerializer):

    class Meta(AttachBaseSerializer.Meta):
        extra_kwargs = {
            'attachment': {'required': False}
        }
        exclude = ('parent_uuid',)

    def update(self, instance, validated_data):
        if 'attachment' in validated_data:
            validated_data['filetype'] = Tools.checkMime(validated_data['attachment'])
            if validated_data['filetype'] == '':
                raise ValidationError({'detail': 'File type not supported'})
        instance.__dict__.update(validated_data)
        instance.save()
        return instance
