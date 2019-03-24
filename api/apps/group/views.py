from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from .serializers import (
    GroupBaseSerializer,
)
from utils.helpers.res_tools import res
from utils.common_classes.custom_pagination import NoPagination


class GroupViewSet(GenericViewSet):
    _name = 'group'
    serializer_class = GroupBaseSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = NoPagination
    search_fields = ('name',)

    def list(self, request):
        queryset = Group.objects.all()
        queryset = self.filter_queryset(queryset)
        serializer = GroupBaseSerializer(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Group, pk=pk)
        serializer = GroupBaseSerializer(obj)
        return res(serializer.data)
