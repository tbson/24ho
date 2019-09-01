from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework_jwt.views import ObtainJSONWebToken

from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.decorators import action
from rest_framework import status
from django.contrib.auth.models import Group
from .models import Staff
from utils.serializers.user import UserSr
from .serializers import StaffBaseSr
from utils.serializers.group import GroupBaseSr
from utils.common_classes.custom_permission import CustomPermission
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.conf import settings
from utils.helpers.tools import Tools
from utils.helpers.res_tools import res, err_res


class StaffViewSet(GenericViewSet):

    _name = 'staff'
    permission_classes = (CustomPermission, )
    serializer_class = StaffBaseSr
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']

    def list(self, request):
        queryset = Staff.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = StaffBaseSr(queryset, many=True)

        result = {
            'items': serializer.data,
            'extra': {
                'list_group': GroupBaseSr(Group.objects.exclude(name='customer'), many=True).data
            }
        }

        return self.get_paginated_response(result)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Staff, pk=pk)
        serializer = StaffBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        data = Tools.parse_user_related_data(request.data)
        userSr = UserSr(data=data['user'])
        if userSr.is_valid(raise_exception=True):
            userSr.save()

        remain = data['remain']
        remain.update({'user': userSr.data['id']})
        serializer = StaffBaseSr(data=remain)
        if serializer.is_valid(raise_exception=True):
            serializer.save()

        serializer.data.update({'user': userSr.data})
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Staff, pk=pk)

        data = Tools.parse_user_related_data(request.data)
        userSr = UserSr(obj.user, data=data['user'])
        if userSr.is_valid(raise_exception=True):
            userSr.save()

        remain = data['remain']
        remain.update({'user': obj.user_id})
        serializer = StaffBaseSr(obj, data=remain)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        item = get_object_or_404(Staff, pk=pk)
        item.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pks = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        for pk in pks:
            item = get_object_or_404(Staff, pk=pk)
            item.delete()
        return res(status=status.HTTP_204_NO_CONTENT)


class LoginView(ObtainJSONWebToken):
    def post(self, request, *args, **kwargs):
        resp = super().post(request, *args, **kwargs)
        if resp.status_code == 200 and resp.data['user'].get('table', '') == 'staffs':
            if resp.data['user']['is_lock'] is True:
                return err_res('Account locked')
            return resp
        return err_res('Wrong username or password.')


class ProfileView(APIView):
    permission_classes = (IsAuthenticated, )

    def get_object(self):
        return self.request.user

    def get(self, request, format=None):
        serializer = StaffBaseSr(self.get_object().staff)
        return res(serializer.data)

    def post(self, request, format=None):
        user = self.get_object()
        obj = user.staff

        data = Tools.parse_user_related_data(request.data)

        userSr = UserSr(user, data=data['user'])
        if userSr.is_valid(raise_exception=True):
            userSr.save()

        remain = data['remain']
        remain.update({'user': user.pk})
        serializer = StaffBaseSr(obj, data=remain)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return res(serializer.data)
        else:
            return err_res(serializer.errors)


class ResetPasswordView(APIView):
    permission_classes = (AllowAny, )

    def get_object(self, queryStr, type="username"):
        if type == "username":
            return Staff.objects.get(user__username=queryStr)
        elif type == "reset_password_token":
            return Staff.objects.get(reset_password_token=queryStr)
        elif type == "change_password_token":
            return Staff.objects.get(change_password_token=queryStr)
        else:
            raise Staff.DoesNotExist

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
        try:
            item = self.get_object(params["username"])
        except Staff.DoesNotExist:
            return res({"url": ""})

        user = item.user

        token = Tools.get_uuid()

        item.reset_password_token = token
        item.reset_password_tmp = make_password(params["password"])
        item.reset_password_created = timezone.now()
        item.save()
        url = settings.BASE_URL + "admin/reset-password/" + str(token)
        subject = "Rest set password for %s %s" % (user.first_name, user.last_name)
        body = "Reset password confirm link: %s" % (url)
        to = user.email

        Tools.send_email_async(subject, body, to)
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
