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

ready_to_export_list = BolViewSet.as_view({
    'get': 'ready_to_export_list',
})

export_check = BolViewSet.as_view({
    'get': 'export_check',
})

export = BolViewSet.as_view({
    'get': 'export',
})

retrieve_uid = BolViewSet.as_view({
    'get': 'retrieve_uid',
})

change_bag = BolViewSet.as_view({
    'put': 'change_bag',
})

get_date = BolViewSet.as_view({
    'get': 'get_date',
})

match_vn = BolViewSet.as_view({
    'post': 'match_vn',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', base_endpoint),
    path('<int:pk>', pk_endpoint),
    path('<str:uid>', retrieve_uid),
    path('<int:pk>/change-bag/', change_bag),
    path('match-vn/', match_vn),
    path('ready-to-export/', ready_to_export_list),
    path('export-check/', export_check),
    path('export/', export),
    path('date/', get_date),
]
