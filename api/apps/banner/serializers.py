from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from django.utils.text import slugify
from django.conf import settings
from utils.helpers.tools import Tools
from .models import Banner, BannerTranslation
from apps.category.models import Category
from apps.category.serializers import CategoryBaseSerializer


class BannerBaseSerializer(ModelSerializer):

    class Meta:
        model = Banner
        exclude = ()
        read_only_fields = ('id',)

    category_title = SerializerMethodField()

    def get_category_title(self, obj):
        return obj.category.title


class BannerRetrieveSerializer(BannerBaseSerializer):
    class Meta(BannerBaseSerializer.Meta):
        exclude = ()
    category = CategoryBaseSerializer()
    translations = SerializerMethodField()

    def get_translations(self, obj):
        result = BannerTranslation.objects.filter(banner=obj.pk)
        return BannerTranslationSerializer(result, many=True).data


class BannerCreateSerializer(BannerBaseSerializer):

    class Meta(BannerBaseSerializer.Meta):
        extra_kwargs = {
            'uid': {'required': False},
        }

    def create(self, validated_data):
        category = validated_data['category']
        if category.single is True:
            if Banner.objects.filter(category_id=category.id).count() >= 1:
                raise serializers.ValidationError({'detail': 'Can not add more item.'})
        validated_data['uid'] = slugify(validated_data['title'])
        banner = Banner(**validated_data)
        banner.save()
        Banner.objects.addTranslations(banner)
        return banner


class BannerUpdateSerializer(BannerBaseSerializer):

    class Meta(BannerBaseSerializer.Meta):
        extra_kwargs = {
            'uid': {'required': False},
            'image': {'required': False},
        }
        exclude = ('uuid',)


class BannerTranslationSerializer(ModelSerializer):

    class Meta:
        model = BannerTranslation
        exclude = ()
        read_only_fields = ('id',)
        extra_kwargs = {
            'banner': {'required': False},
            'lang': {'required': False},
        }


class BannerTranslationListSerializer(BannerBaseSerializer):

    class Meta(BannerBaseSerializer.Meta):
        exclude = ()
    title = SerializerMethodField()
    description = SerializerMethodField()

    def get_title(self, obj):
        lang = Tools.langFromContext(self.context)
        if lang not in settings.LANGUAGES or lang == settings.LANGUAGES[0]:
            return obj.title
        translation = BannerTranslation.objects.filter(banner=obj.pk, lang=lang).first()
        return translation.title if translation.title else obj.title

    def get_description(self, obj):
        lang = Tools.langFromContext(self.context)
        if lang not in settings.LANGUAGES:
            return obj.description
        translation = BannerTranslation.objects.filter(banner=obj.pk, lang=lang).first()
        return translation.description
