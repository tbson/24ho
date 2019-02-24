
from django.http import Http404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import Permission
from .serializers import (
    PermissionBaseSerializer,
)
from utils.common_classes.custom_permission import CustomPermissionExp


class PermissionViewSet(GenericViewSet):
    permissions = (
        'list_permission',
        'retrieve_permission',
        'add_permission',
        'change_permission',
        'delete_permission',
        'delete_list_permission',
    )
    name = 'permission'
    serializer_class = PermissionBaseSerializer
    permission_classes = (CustomPermissionExp, )
    search_fields = ('codename', 'name')
    ordering_fields = ('codename', 'name')
    ordering = ('content_type__app_label',)

    def list(self, request):
        queryset = Permission.objects.all()
        queryset = self.filter_queryset(queryset)
        serializer = PermissionBaseSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = Permission.objects.get(pk=pk)
        serializer = PermissionBaseSerializer(obj)
        return Response(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = PermissionBaseSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = Permission.objects.get(pk=pk)
        serializer = PermissionBaseSerializer(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        Permission.objects.get(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Permission.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
