import os
from django.urls import path
from .views import (
    RateViewSet,
    ExposeView,
)


base_endpoint = RateViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pk_endpoint = RateViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', base_endpoint),
    path('<int:pk>', pk_endpoint),
    path('latest/', ExposeView.as_view(), name='latest'),
]
