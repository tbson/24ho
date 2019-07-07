import os
from django.urls import path
from .views import (
    BolViewSet,
)


base_endpoint = BolViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pk_endpoint = BolViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

retrieve_uid = BolViewSet.as_view({
    'get': 'retrieve_uid',
})

get_order_items_for_checking = BolViewSet.as_view({
    'get': 'get_order_items_for_checking',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', base_endpoint),
    path('<int:pk>', pk_endpoint),
    path('<str:uid>', retrieve_uid),
    path('get-order-items-for-checking/<str:uid>', get_order_items_for_checking),
]
