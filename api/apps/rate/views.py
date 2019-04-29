from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Rate
from apps.variable.models import Variable
from .serializers import (
    RateBaseSr,
)
from utils.common_classes.custom_permission import CustomPermission
from utils.helpers.res_tools import res
from django.conf import settings


class RateViewSet(GenericViewSet):
    _name = 'rate'
    serializer_class = RateBaseSr
    permission_classes = (CustomPermission, )
    search_fields = ('rate', )

    def list(self, request):
        queryset = Rate.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = RateBaseSr(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Rate, pk=pk)
        serializer = RateBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = RateBaseSr(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Rate, pk=pk)
        serializer = RateBaseSr(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(Rate, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Rate.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return res(status=status.HTTP_204_NO_CONTENT)


class ExposeView(APIView):
    permission_classes = (AllowAny, )

    def get(self, request, format=None):
        value = settings.DEFAULT_RATE
        real_value = settings.DEFAULT_REAL_RATE
        try:
            item = Rate.objects.latest('pk')
            value = item.order_rate
            real_value = item.rate
        except Rate.DoesNotExist:
            try:
                value = Variable.objects.get(uid='rate').value
            except Variable.DoesNotExist:
                pass
        return res({'value': int(value), 'real_value': int(real_value)})
