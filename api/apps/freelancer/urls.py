import os
from django.urls import path
from rest_framework_jwt.views import (
    refresh_jwt_token,
    verify_jwt_token,
)
from .views import (
    FreelancerViewSet,
    LoginView,
    ProfileView,
    ResetPasswordView,
    ChangePasswordView,
)

baseEndPoint = FreelancerViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pkEndpoint = FreelancerViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', baseEndPoint),
    path('<int:pk>', pkEndpoint),

    path('token-auth/', LoginView.as_view(), name='login'),
    path('token-refresh/', refresh_jwt_token, name='refresh'),
    path('token-verify/', verify_jwt_token, name='verify'),

    path('profile/', ProfileView.as_view(), name='profile'),
    path('reset-password/', ResetPasswordView.as_view(), name='resetPassword'),
    path('change-password/', ChangePasswordView.as_view(), name='changePassword'),
]
