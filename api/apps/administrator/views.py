from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework_jwt.views import ObtainJSONWebToken

from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.decorators import action
from rest_framework import status
from .models import Administrator
from .serializers import (
    AdministratorBaseSerializer,
    AdministratorRetrieveSerializer,
    AdministratorCreateSerializer,
    AdministratorUpdateSerializer,
)
from utils.common_classes.custom_permission import CustomPermission
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.conf import settings
from utils.helpers.tools import Tools
from utils.helpers.res_tools import res, err_res


class AdministratorViewSet(GenericViewSet):

    _name = 'administrator'
    permission_classes = (CustomPermission, )
    serializer_class = AdministratorBaseSerializer
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']

    def list(self, request):
        queryset = Administrator.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = AdministratorBaseSerializer(queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Administrator, pk=pk)
        serializer = AdministratorRetrieveSerializer(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        serializer = AdministratorCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Administrator, pk=pk)
        serializer = AdministratorUpdateSerializer(obj, data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        obj = get_object_or_404(Administrator, pk=pk)
        obj.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pk = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        result = Administrator.objects.filter(pk__in=pk)
        if result.count() == 0:
            raise Http404
        result.delete()
        return res(status=status.HTTP_204_NO_CONTENT)


class LoginView(ObtainJSONWebToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and response.data['user']['table'] == 'administrators':
            return response
        return err_res('Wrong username or password.')


class ProfileView(APIView):
    permission_classes = (IsAuthenticated, )

    def get_object(self):
        return self.request.user

    def get(self, request, format=None):
        serializer = AdministratorBaseSerializer(self.get_object().administrator)
        return res(serializer.data)

    def post(self, request, format=None):
        params = self.request.data
        administrator = self.get_object().administrator
        serializer = AdministratorUpdateSerializer(administrator, data=params, partial=True)
        if serializer.is_valid() is True:
            serializer.save()
            return res(serializer.data)
        else:
            return err_res(serializer.errors)


class ResetPasswordView(APIView):
    permission_classes = (AllowAny, )

    def get_object(self, queryStr, type="username"):
        try:
            if type == "username":
                return Administrator.objects.get(user__username=queryStr)
            elif type == "reset_password_token":
                return Administrator.objects.get(reset_password_token=queryStr)
            elif type == "change_password_token":
                return Administrator.objects.get(change_password_token=queryStr)
            else:
                raise Http404
        except Administrator.DoesNotExist:
            raise Http404

    # Reset password confirm
    def get(self, request, format=None):
        token = self.request.GET.get("token", "")
        item = self.get_object(token, "reset_password_token")
        user = item.user
        if item.reset_password_token == "":
            raise Http404
        user.password = item.reset_password_tmp
        item.reset_password_tmp = ""
        item.reset_password_token = ""
        item.reset_password_created = None
        user.save()
        item.save()
        return res({})

    # Reset password
    def post(self, request, format=None):
        params = self.request.data
        item = self.get_object(params["username"])
        user = item.user

        token = Tools.getUuid()

        item.reset_password_token = token
        item.reset_password_tmp = make_password(params["password"])
        item.reset_password_created = timezone.now()
        item.save()
        url = settings.BASE_URL + "admin/reset-password/" + str(token)
        subject = "Rest set password for %s %s" % (user.first_name, user.last_name)
        body = "Reset password confirm link: %s" % (url)
        to = user.email

        Tools.sendEmailAsync(subject, body, to)
        return res({"url": url})


class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def post(self, request, format=None):
        params = self.request.data

        user = self.get_object()

        # Check correct old password
        if check_password(params["oldPassword"], user.password) is False:
            return err_res({"detail": "Incorrect old password"})

        user.password = make_password(params["password"])
        user.save()

        return res({})
