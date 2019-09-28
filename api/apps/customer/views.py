import json
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework_jwt.views import ObtainJSONWebToken

from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import (GenericViewSet, )
from rest_framework.decorators import action
from rest_framework import status
from .models import Customer
from apps.staff.models import Staff
from apps.customer_group.models import CustomerGroup
from utils.serializers.user import UserSr
from .serializers import CustomerBaseSr
from apps.staff.serializers import StaffSelectSr
from apps.customer_group.serializers import CustomerGroupSelectSr
from utils.common_classes.custom_permission import CustomPermission
from django.http.request import QueryDict
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
from utils.helpers.tools import Tools
from utils.helpers.res_tools import res, err_res


class CustomerViewSet(GenericViewSet):

    _name = 'customer'
    permission_classes = (CustomPermission, )
    serializer_class = CustomerBaseSr
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']

    def list(self, request):
        queryset = Customer.objects.all()
        queryset = self.filter_queryset(queryset)
        queryset = self.paginate_queryset(queryset)
        serializer = CustomerBaseSr(queryset, many=True)

        result = {
            'items': serializer.data,
            'extra': {
                'list_sale': StaffSelectSr(Staff.objects.getListSale(), many=True).data,
                'list_cust_care': StaffSelectSr(Staff.objects.getListCustCare(), many=True).data,
                'list_group': CustomerGroupSelectSr(CustomerGroup.objects.all(), many=True).data
            }
        }
        return self.get_paginated_response(result)

    def retrieve(self, request, pk=None):
        obj = get_object_or_404(Customer, pk=pk)
        serializer = CustomerBaseSr(obj)
        return res(serializer.data)

    @action(methods=['post'], detail=True)
    def add(self, request):
        data = Tools.parse_user_related_data(request.data)
        userSr = UserSr(data=data['user'])
        if userSr.is_valid(raise_exception=True):
            userSr.save()

        remain = data['remain']
        remain.update({'user': userSr.data['id']})
        if type(remain.get('avatar')) is not InMemoryUploadedFile:
            remain.pop('avatar', None)
        serializer = CustomerBaseSr(data=remain)
        if serializer.is_valid(raise_exception=True):
            serializer.save()

        serializer.data.update({'user': userSr.data})
        return res(serializer.data)

    @action(methods=['put'], detail=True)
    def change(self, request, pk=None):
        obj = get_object_or_404(Customer, pk=pk)

        data = Tools.parse_user_related_data(request.data)
        userSr = UserSr(obj.user, data=data['user'])
        if userSr.is_valid(raise_exception=True):
            userSr.save()

        remain = data['remain']
        remain.update({'user': obj.user_id})
        if type(remain.get('avatar')) is not InMemoryUploadedFile:
            remain.pop('avatar', None)
        serializer = CustomerBaseSr(obj, data=remain)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return res(serializer.data)

    @action(methods=['delete'], detail=True)
    def delete(self, request, pk=None):
        item = get_object_or_404(Customer, pk=pk)
        item.delete()
        return res(status=status.HTTP_204_NO_CONTENT)

    @action(methods=['delete'], detail=False)
    def delete_list(self, request):
        pk = self.request.query_params.get('ids', '')
        pks = [int(pk)] if pk.isdigit() else map(lambda x: int(x), pk.split(','))
        for pk in pks:
            item = get_object_or_404(Customer, pk=pk)
            item.delete()
        return res(status=status.HTTP_204_NO_CONTENT)


class LoginView(ObtainJSONWebToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and response.data['user'].get('table', '') == 'customers':
            if response.data['user']['is_lock'] is True:
                return err_res('Account locked')
            return response
        return err_res({'detail': 'Wrong username or password.'})


class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get(self, request, format=None):
        try:
            serializer = CustomerBaseSr(self.get_object().customer)
            return res(serializer.data)
        except Exception:
            return res({}, status=401)

    def post(self, request, format=None):
        user = self.get_object()
        obj = user.customer
        data = request.data
        if (type(request.data) is QueryDict):
            data = request.data.dict()

        data = Tools.parse_user_related_data(data)

        userSr = UserSr(user, data=data['user'])
        if userSr.is_valid(raise_exception=True):
            userSr.save()

        remain = data['remain']
        remain.update({'user': user.pk})
        if type(remain.get('avatar')) is not InMemoryUploadedFile:
            remain.pop('avatar', None)
        serializer = CustomerBaseSr(obj, data=remain)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return res(serializer.data)
        else:
            return err_res(serializer.errors)


class ShoppingCartView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user.customer

    def get(self, request, format=None):
        try:
            customer = self.get_object()
            return res(customer.shopping_cart)
        except Exception:
            return res({}, status=401)

    def post(self, request, format=None):
        customer = self.get_object()
        shopping_cart = request.data.get('shopping_cart', '{}')
        customer.shopping_cart = json.loads(shopping_cart)
        customer.save()
        return res(customer.shopping_cart)


class AccountSummaryView(APIView):
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user.customer

    def get(self, request, format=None):
        from apps.transaction.utils import TransactionUtils
        try:
            customer = self.get_object()
            data = {
                "balance": TransactionUtils.get_customer_balance(customer.pk),
                "deposit_factor": customer.deposit_factor
            }
            return res(data)
        except Exception:
            return res({}, status=401)


class ResetPasswordView(APIView):
    permission_classes = (AllowAny, )

    def get_object(self, queryStr, type="username"):
        if type == "username":
            return Customer.objects.get(user__username=queryStr)
        elif type == "reset_password_token":
            return Customer.objects.get(reset_password_token=queryStr)
        elif type == "change_password_token":
            return Customer.objects.get(change_password_token=queryStr)
        else:
            raise Customer.DoesNotExist

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
        except Customer.DoesNotExist:
            return res({"url": ""})

        user = item.user

        token = Tools.get_uuid()

        item.reset_password_token = token
        item.reset_password_tmp = make_password(params["password"])
        item.reset_password_created = timezone.now()
        item.save()
        url = settings.BASE_URL + "user/reset-password/" + str(token)
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
