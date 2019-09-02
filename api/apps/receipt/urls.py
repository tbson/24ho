import os
from django.urls import path
from .views import (
    ReceiptViewSet,
)


base_endpoint = ReceiptViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pk_endpoint = ReceiptViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

retrieve_to_print = ReceiptViewSet.as_view({
    'get': 'retrieve_to_print',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', base_endpoint),
    path('<int:pk>', pk_endpoint),
    path('print/<int:pk>', retrieve_to_print),
]
