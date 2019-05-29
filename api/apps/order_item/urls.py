import os
from django.urls import path
from .views import (
    OrderItemViewSet,
)


base_endpoint = OrderItemViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pk_endpoint = OrderItemViewSet.as_view({
    'get': 'retrieve',
    'delete': 'delete'
})

change_color = OrderItemViewSet.as_view({
    'put': 'change_color',
})

change_size = OrderItemViewSet.as_view({
    'put': 'change_size',
})

change_quantity = OrderItemViewSet.as_view({
    'put': 'change_quantity',
})


change_note = OrderItemViewSet.as_view({
    'put': 'change_note',
})

change_unit_price = OrderItemViewSet.as_view({
    'put': 'change_unit_price',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', base_endpoint),
    path('<int:pk>', pk_endpoint),
    path('<int:pk>/change-color/', change_color),
    path('<int:pk>/change-size/', change_size),
    path('<int:pk>/change-quantity/', change_quantity),
    path('<int:pk>/change-note/', change_note),
    path('<int:pk>/change-unit-price/', change_unit_price),
]
