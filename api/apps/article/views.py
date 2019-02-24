from django.http import Http404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Article, ArticleTranslation
from .serializers import (
    ArticleTranslationSerializer,
    ArticleBaseSerializer,
    ArticleRetrieveSerializer,
    ArticleCreateSerializer,
    ArticleUpdateSerializer,
    ArticleLandingListSerializer,
    ArticleLandingRetrieveSerializer
)
from utils.common_classes.custom_permission import CustomPermission


class ArticleViewSet(GenericViewSet):

    name = 'article'
    serializer_class = ArticleBaseSerializer
    permission_classes = (CustomPermission, )
    search_fields = ('slug', 'value')
    filter_fields = ('category', 'article', )

    def list(self, request):
        queryset = Article.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = ArticleBaseSerializer(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = Article.objects.get(pk=pk)
        serializer = ArticleRetrieveSerializer(obj)
        return Response(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = ArticleCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = Article.objects.get(pk=pk)
        serializer = ArticleUpdateSerializer(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['put'], detail=True)
    def change_translation(self, request, pk=None):
        obj = ArticleTranslation.objects.get(pk=pk)
        serializer = ArticleTranslationSerializer(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        Article.objects.get(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Article.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ArticleLandingViewSet(GenericViewSet):
    permission_classes = (AllowAny, )
    filter_fields = ('category__uid', 'article_type__uid', )

    def list(self, request):
        queryset = Article.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = ArticleLandingListSerializer(queryset, many=True, context={'request': request})

        extra = {}
        categoryUid = request.query_params.get('category__uid', None)
        articleTypeUid = request.query_params.get('article_type__uid', None)
        if categoryUid is not None:
            extra[categoryUid] = Category.objects.getTitleFromUid(categoryUid, Tools.langFromRequest(request))
        if articleTypeUid is not None:
            extra[articleTypeUid] = ArticleType.objects.getTitleFromUid(articleTypeUid, Tools.langFromRequest(request))

        result = {
            'items': serializer.data,
            'extra': extra
        }
        return self.get_paginated_response(result)

    def retrieve(self, request, id):
        if id.isdigit():
            id = int(id)
            obj = Article.objects.get(pk=id)
        else:
            obj = Article.objects.filter(category__uid=id).first()
        serializer = ArticleLandingRetrieveSerializer(obj, context={'request': request})
        return Response(serializer.data)
