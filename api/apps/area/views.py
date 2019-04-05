from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Area
from .serializers import (
    AreaBaseSr,
)
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res


class AreaViewSet(GenericViewSet):
    _name = 'area'
    serializer_class = AreaBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('uid', 'value')

    def list(self, request):
        queryset = Area.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = AreaBaseSr(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Area, pk=pk)
        serializer = AreaBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = AreaBaseSr(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Area, pk=pk)
        serializer = AreaBaseSr(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(Area, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Area.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
