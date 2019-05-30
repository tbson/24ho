from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework import status
from .models import OrderItem
from .utils import OrderItemUtils
from .serializers import (
    OrderItemBaseSr,
)
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res
from utils.common_classes.custom_pagination import NoPagination


class OrderItemViewSet(GenericViewSet):
    _name = 'order_item'
    serializer_class = OrderItemBaseSr
    permission_classes = (CustomPermission, )
    pagination_class = NoPagination
    search_fields = ('title', 'color', 'size', 'unit_price', 'note', )
    filterset_fields = ('order_id', )

    def list(self, request):
        queryset = OrderItem.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = OrderItemBaseSr(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(OrderItem, pk=pk)
        serializer = OrderItemBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = OrderItemBaseSr(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_color(self, request, pk=None):
        obj = get_object_or_404(OrderItem, pk=pk)
        value = request.data.get('value', obj.color)
        serializer = OrderItemUtils.partial_update(obj, 'color', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_size(self, request, pk=None):
        obj = get_object_or_404(OrderItem, pk=pk)
        value = request.data.get('value', obj.size)
        serializer = OrderItemUtils.partial_update(obj, 'size', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_quantity(self, request, pk=None):
        obj = get_object_or_404(OrderItem, pk=pk)
        value = request.data.get('value', obj.quantity)
        serializer = OrderItemUtils.partial_update(obj, 'quantity', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_unit_price(self, request, pk=None):
        obj = get_object_or_404(OrderItem, pk=pk)
        value = request.data.get('value', obj.unit_price)
        serializer = OrderItemUtils.partial_update(obj, 'unit_price', value)
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change_note(self, request, pk=None):
        obj = get_object_or_404(OrderItem, pk=pk)
        value = request.data.get('value', obj.note)
        serializer = OrderItemUtils.partial_update(obj, 'note', value)
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(OrderItem, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = OrderItem.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return res(status=status.HTTP_204_NO_CONTENT)
