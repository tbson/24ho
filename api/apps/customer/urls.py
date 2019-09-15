import os
from django.urls import path
from rest_framework_jwt.views import (
    refresh_jwt_token,
    verify_jwt_token,
)
from .views import (
    CustomerViewSet,
    LoginView,
    ProfileView,
    ShoppingCartView,
    ResetPasswordView,
    ChangePasswordView,
    AccountSummaryView
)

base_endpoint = CustomerViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pk_endpoint = CustomerViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', base_endpoint),
    path('<int:pk>', pk_endpoint),

    path('auth/', LoginView.as_view(), name='login'),
    path('token-refresh/', refresh_jwt_token, name='refresh'),
    path('token-verify/', verify_jwt_token, name='verify'),

    path('profile/', ProfileView.as_view(), name='profile'),
    path('shopping-cart/', ShoppingCartView.as_view(), name='shoppingCart'),
    path('account-summary/', AccountSummaryView.as_view(), name='accountSummary'),
    path('reset-password/', ResetPasswordView.as_view(), name='resetPassword'),
    path('change-password/', ChangePasswordView.as_view(), name='changePassword'),
]
