from rest_framework.response import Response
from rest_framework import status
from apps.staff.serializers import StaffBaseSr
from apps.customer.serializers import CustomerBaseSr
from django.db import models
from django.contrib.auth.models import Permission
from typing import List


def get_visible_menus(groups: List[models.QuerySet]) -> List[str]:
    result: List = []
    for group in groups:
        permissions = group.permissions.filter(codename__startswith='view_')
        for pem in permissions:
            codename_arr = pem.codename.split('_')
            if len(codename_arr) != 2:
                continue
            menu = codename_arr[1]
            if menu not in result:
                result.append(menu)
    return result


def get_all_menus() -> List[str]:
    result: List = []
    permissions = Permission.objects.all()
    for pem in permissions:
        codename_arr = pem.codename.split('_')
        if len(codename_arr) != 2:
            continue
        menu = codename_arr[1]
        if menu not in result:
            result.append(menu)
    return result


def jwt_response_payload_handler(token, user=None, request=None):
    data = {}
    if hasattr(user, 'staff'):
        parent = user.staff
        parent.fingerprint = request.META.get('HTTP_FINGERPRINT', '')
        parent.save()
        data = StaffBaseSr(parent).data
        data['is_admin'] = True
        data['table'] = 'staffs'

        if user.is_superuser:
            data['visible_menus'] = get_all_menus()
        else:
            groups = user.groups.all()
            data['visible_menus'] = get_visible_menus(groups)
        print(data)
    elif hasattr(user, 'customer'):
        parent = user.customer
        parent.fingerprint = request.META.get('HTTP_FINGERPRINT', '')
        data = CustomerBaseSr(parent).data
        parent.save()
        data['table'] = 'customers'
        groups = user.groups.all()
        data['visible_menus'] = get_visible_menus(groups)
    data['token'] = token

    return {
        'user': data
    }


def get_token(headers):
    result = headers.get('Authorization', None)
    if(result):
        return result.split(' ')[1]
    return ''


def error_format(data):
    if type(data) is str:
        return {'detail': data}
    if type(data) is dict:
        return data
    return {}


def res(*args, **kwargs):
    return Response(*args, **kwargs)


def err_res(data, status_code=status.HTTP_400_BAD_REQUEST):
    return Response(error_format(data), status=status_code)
