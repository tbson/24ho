from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from rest_framework.serializers import SerializerMethodField
from django.utils.text import slugify
from django.conf import settings
from utils.helpers.tools import Tools
from .models import Article, ArticleTranslation
from apps.category.models import Category
from apps.attach.models import Attach
from apps.tag.models import Tag
from apps.attach.serializers import AttachBaseSerializer
from apps.category.serializers import CategoryBaseSerializer
from apps.tag.serializers import TagConsumeSerializer


class ArticleBaseSerializer(ModelSerializer):

    class Meta:
        model = Article
        exclude = ('content', )
        read_only_fields = ('id', 'tags')

    category_title = SerializerMethodField()

    def get_category_title(self, obj):
        if obj.category:
            return obj.category.title
        return obj.article.category.title


class ArticleRetrieveSerializer(ArticleBaseSerializer):

    class Meta(ArticleBaseSerializer.Meta):
        exclude = ()
    category = CategoryBaseSerializer()
    translations = SerializerMethodField()

    def get_translations(self, obj):
        result = ArticleTranslation.objects.filter(article=obj.pk)
        return ArticleTranslationSerializer(result, many=True).data


class ArticleCreateSerializer(ArticleBaseSerializer):

    class Meta(ArticleBaseSerializer.Meta):
        exclude = ()

    def create(self, validated_data):
        if 'category' in validated_data:
            category = validated_data['category']
            if category.single is True:
                if Article.objects.filter(category_id=category.id).count() >= 1:
                    raise serializers.ValidationError({'detail': 'Can not add more item.'})
        validated_data['slug'] = slugify(validated_data['slug'])
        if Article.objects.filter(slug=validated_data['slug']).count() >= 1:
            raise serializers.ValidationError({'slug': 'Duplicate slug.'})
        article = Article(**validated_data)
        article.save()

        for tag in self.initial_data['tags'].split(','):
            if tag.isdigit():
                article.tags.add(tag)

        Article.objects.addTranslations(article)
        return article


class ArticleUpdateSerializer(ArticleBaseSerializer):

    class Meta(ArticleBaseSerializer.Meta):
        exclude = ('uuid',)

    def update(self, instance, validated_data):
        instance.tags.clear()
        for tag in self.initial_data['tags'].split(','):
            if tag.isdigit():
                instance.tags.add(tag)
        validated_data['slug'] = slugify(validated_data['slug'])
        if Article.objects.exclude(pk=instance.pk).filter(slug=validated_data['slug']).count() >= 1:
            raise serializers.ValidationError({'slug': 'Duplicate slug.'})
        instance.__dict__.update(validated_data)
        instance.save()
        return instance


class ArticleTranslationSerializer(ModelSerializer):

    class Meta:
        model = ArticleTranslation
        exclude = ()
        read_only_fields = ('id',)
        extra_kwargs = {
            'article': {'required': False},
            'lang': {'required': False},
        }


class ArticleLandingSerializer(ArticleBaseSerializer):

    class Meta(ArticleBaseSerializer.Meta):
        exclude = ()
    title = SerializerMethodField()
    description = SerializerMethodField()
    content = SerializerMethodField()

    def get_title(self, obj):
        lang = Tools.langFromContext(self.context)
        if lang not in settings.LANGUAGES or lang == settings.LANGUAGES[0]:
            return obj.title
        translation = ArticleTranslation.objects.filter(article=obj.pk, lang=lang).first()
        return translation.title if translation.title else obj.title

    def get_description(self, obj):
        lang = Tools.langFromContext(self.context)
        if lang not in settings.LANGUAGES:
            return obj.description
        translation = ArticleTranslation.objects.filter(article=obj.pk, lang=lang).first()
        return translation.description if translation.description else obj.description

    def get_content(self, obj):
        lang = Tools.langFromContext(self.context)
        if lang not in settings.LANGUAGES:
            return obj.content
        translation = ArticleTranslation.objects.filter(article=obj.pk, lang=lang).first()
        return translation.content if translation.content else obj.content


class ArticleLandingListSerializer(ArticleLandingSerializer):
    content = None
    tags = None


class ArticleLandingRetrieveSerializer(ArticleLandingSerializer):
    class Meta(ArticleBaseSerializer.Meta):
        exclude = ()
    related_articles = ArticleBaseSerializer(many=True, read_only=True)
    category = CategoryBaseSerializer()
    same_tag_articles = SerializerMethodField()
    attaches = SerializerMethodField()
    tag_list = SerializerMethodField()

    def get_tag_list(self, obj):
        return TagConsumeSerializer(Tag.objects.all(), many=True).data

    def get_attaches(self, obj):
        result = Attach.objects.filter(parent_uuid=obj.uuid, richtext_image=False)
        return AttachBaseSerializer(result, many=True).data

    def get_same_tag_articles(self, obj):
        result = Article.objects.exclude(pk=obj.pk).filter(tags__in=obj.tags.all()).order_by('-id')
        return ArticleBaseSerializer(result, many=True).data
