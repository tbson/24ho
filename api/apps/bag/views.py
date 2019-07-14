from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import Bag
from .serializers import (
    BagBaseSr,
)
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res


class BagViewSet(GenericViewSet):
    _name = 'bag'
    serializer_class = BagBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('uid', )

    def get_object(self, pk):
        obj = get_object_or_404(Bag, pk=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def list(self, request):
        queryset = Bag.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = BagBaseSr(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Bag, pk=pk)
        serializer = BagBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        data = request.data
        serializer = BagBaseSr(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = self.get_object(pk)
        serializer = BagBaseSr(obj, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = self.get_object(pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pks = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        for pk in pks:
            obj = self.get_object(pk)
            obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
