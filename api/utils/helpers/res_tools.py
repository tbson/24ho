from rest_framework.response import Response
from rest_framework import status
from rest_framework_jwt.serializers import VerifyJSONWebTokenSerializer
from apps.administrator.serializers import AdministratorBaseSerializer
from apps.customer.serializers import CustomerBaseSerializer


def jwt_response_payload_handler(token, user=None, request=None):
    data = []
    if hasattr(user, 'administrator'):
        parent = user.administrator
        parent.fingerprint = request.META.get('HTTP_FINGERPRINT', '')
        parent.save()
        data = AdministratorBaseSerializer(parent).data
        data['is_admin'] = True
        data['table'] = 'administrators'
    elif hasattr(user, 'customer'):
        parent = user.customer
        parent.fingerprint = request.META.get('HTTP_FINGERPRINT', '')
        data = CustomerBaseSerializer(parent).data
        parent.save()
        data['table'] = 'customers'
    data['token'] = token

    return {
        'user': data
    }


def getToken(headers):
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
