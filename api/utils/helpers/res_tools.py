from rest_framework_jwt.serializers import VerifyJSONWebTokenSerializer
from apps.administrator.serializers import AdministratorBaseSerializer
from apps.freelancer.serializers import FreelancerBaseSerializer
from apps.employer.serializers import EmployerBaseSerializer


def jwt_response_payload_handler(token, user=None, request=None):
    if hasattr(user, 'administrator'):
        parent = user.administrator
        parent.fingerprint = request.META.get('HTTP_FINGERPRINT', '')
        parent.save()
        data = AdministratorBaseSerializer(parent).data
        data['is_admin'] = True
        data['table'] = 'administrators'
    elif hasattr(user, 'freelancer'):
        parent = user.freelancer
        parent.fingerprint = request.META.get('HTTP_FINGERPRINT', '')
        data = FreelancerBaseSerializer(parent).data
        parent.save()
        data['table'] = 'freelancers'
    elif hasattr(user, 'employer'):
        parent = user.employer
        parent.fingerprint = request.META.get('HTTP_FINGERPRINT', '')
        data = EmployerBaseSerializer(parent).data
        parent.save()
        data['table'] = 'employers'
    data['token'] = token

    return {
        'user': data
    }


def getToken(headers):
    result = headers.get('Authorization', None)
    if(result):
        return result.split(' ')[1]
    return ''
