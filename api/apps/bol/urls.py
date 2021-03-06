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

mark_cn = BolViewSet.as_view({
    'put': 'mark_cn',
})
unmark_cn = BolViewSet.as_view({
    'put': 'unmark_cn',
})

mark_cn_by_uploading = BolViewSet.as_view({
    'post': 'mark_cn_by_uploading',
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
    path('mark-cn/<int:pk>', mark_cn),
    path('mark-cn-by-uploading/', mark_cn_by_uploading),
    path('unmark-cn/<int:pk>', unmark_cn),
]
