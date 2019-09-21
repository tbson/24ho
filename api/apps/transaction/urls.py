import os
from django.urls import path
from .views import (
    TransactionViewSet,
)


base_endpoint = TransactionViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pk_endpoint = TransactionViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

retrieve_to_print = TransactionViewSet.as_view({
    'get': 'retrieve_to_print',
})

get_total_statistics = TransactionViewSet.as_view({
    'get': 'get_total_statistics',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', base_endpoint),
    path('<int:pk>', pk_endpoint),
    path('print/<int:pk>', retrieve_to_print),
    path('total-statistics/', get_total_statistics),
]
