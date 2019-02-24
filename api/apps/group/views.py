
from django.http import Http404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import Group
from .serializers import (
    GroupBaseSerializer,
)
from utils.common_classes.custom_permission import CustomPermissionExp


class GroupViewSet(GenericViewSet):
    permissions = (
        'list_group',
        'retrieve_group',
        'add_group',
        'change_group',
        'delete_group',
        'delete_list_group',
    )
    name = 'group'
    serializer_class = GroupBaseSerializer
    permission_classes = (CustomPermissionExp, )
    search_fields = ('name',)

    def list(self, request):
        queryset = Group.objects.all()
        queryset = self.filter_queryset(queryset)
        serializer = GroupBaseSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = Group.objects.get(pk=pk)
        serializer = GroupBaseSerializer(obj)
        return Response(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = GroupBaseSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = Group.objects.get(pk=pk)
        serializer = GroupBaseSerializer(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        Group.objects.get(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Group.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
