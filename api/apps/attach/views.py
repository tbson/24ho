from django.http import Http404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.response import Response
from rest_framework import status
from .models import Attach
from .serializers import (
    AttachBaseSerializer,
    AttachCreateSerializer,
    AttachUpdateSerializer
)
from utils.common_classes.custom_permission import CustomPermissionExp
from utils.helpers.tools import Tools


class AttachViewSet(GenericViewSet):
    permissions = (
        'list_attach',
        'retrieve_attach',
        'add_attach',
        'change_attach',
        'delete_attach',
        'delete_list_attach',
    )
    name = 'attach'
    serializer_class = AttachBaseSerializer
    permission_classes = (CustomPermissionExp, )
    search_fields = ('title',)
    filter_fields = ('parent_uuid', 'richtext_image',)

    def list(self, request):
        query = self.request.GET.dict()
        if 'richtext_image' in query:
            query['richtext_image'] = Tools.stringToBool(query['richtext_image'])
        queryset = Attach.objects.filter(**query)
        queryset = self.filter_queryset(queryset)
        serializer = AttachBaseSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = Attach.objects.get(pk=pk)
        serializer = AttachBaseSerializer(obj)
        return Response(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = AttachCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = Attach.objects.get(pk=pk)
        serializer = AttachUpdateSerializer(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        Attach.objects.get(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Attach.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
