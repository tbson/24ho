from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from django.utils.text import slugify
from django.conf import settings
from utils.helpers.tools import Tools
from .models import Category, CategoryTranslation


class CategoryBaseSerializer(ModelSerializer):

    class Meta:
        model = Category
        exclude = ()
        extra_kwargs = {
            'uid': {'required': False},
            'image_ratio': {'required': False},
            'width_ratio': {'required': False}
        }
        read_only_fields = ('id',)

    translations = SerializerMethodField()

    def get_translations(self, obj):
        result = CategoryTranslation.objects.filter(category=obj.pk)
        return CategoryTranslationSerializer(result, many=True).data

    def create(self, validated_data):
        validated_data['uid'] = slugify(validated_data['title'])
        category = Category(**validated_data)
        category.save()
        return category


class CategoryTranslationSerializer(ModelSerializer):

    class Meta:
        model = CategoryTranslation
        exclude = ()
        read_only_fields = ('id',)
        extra_kwargs = {
            'category': {'required': False},
            'lang': {'required': False},
        }


class CategoryTranslationListSerializer(CategoryBaseSerializer):

    class Meta(CategoryBaseSerializer.Meta):
        exclude = ('image_ratio', 'single', 'type', 'width_ratio')
    title = SerializerMethodField()
    translations = None

    def get_title(self, obj):
        lang = self.context.get('lang', None)
        if lang is None:
            lang = Tools.langFromContext(self.context)
        if lang not in settings.LANGUAGES or lang == settings.LANGUAGES[0]:
            return obj.title
        translation = CategoryTranslation.objects.filter(category=obj.pk, lang=lang).first()
        return translation.title if translation.title else obj.title
