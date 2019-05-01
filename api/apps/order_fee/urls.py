import os
from django.urls import path
from .views import (
    OrderFeeViewSet,
)


baseEndPoint = OrderFeeViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pkEndpoint = OrderFeeViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', baseEndPoint),
    path('<int:pk>', pkEndpoint),
]
