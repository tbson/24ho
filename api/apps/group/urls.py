import os
from django.urls import path
from .views import (
    GroupViewSet,
)


base_endpoint = GroupViewSet.as_view({
    'get': 'list',
})

pk_endpoint = GroupViewSet.as_view({
    'get': 'retrieve',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', base_endpoint),
    path('<int:pk>', pk_endpoint),
]
