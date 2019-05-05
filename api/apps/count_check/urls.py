import os
from django.urls import path
from .views import (
    CountCheckViewSet,
)


baseEndPoint = CountCheckViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pkEndpoint = CountCheckViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', baseEndPoint),
    path('<int:pk>', pkEndpoint),
]
