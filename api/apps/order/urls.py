import os
from django.urls import path
from .views import (
    OrderViewSet,
)


base = OrderViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pk = OrderViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

change_sale = OrderViewSet.as_view({
    'put': 'change_sale',
})

change_cust_care = OrderViewSet.as_view({
    'put': 'change_cust_care',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = (
    path('', base),
    path('<int:pk>', pk),
    path('<int:pk>/change-sale/', change_sale),
    path('<int:pk>/change-cust-care/', change_cust_care),
)
