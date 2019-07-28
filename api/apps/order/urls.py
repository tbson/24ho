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
    'delete': 'delete'
})

change_sale = OrderViewSet.as_view({
    'put': 'change_sale',
})

change_cust_care = OrderViewSet.as_view({
    'put': 'change_cust_care',
})

change_rate = OrderViewSet.as_view({
    'put': 'change_rate',
})

change_address = OrderViewSet.as_view({
    'put': 'change_address',
})

change_count_check_fee_input = OrderViewSet.as_view({
    'put': 'change_count_check_fee_input',
})

change_cny_inland_delivery_fee = OrderViewSet.as_view({
    'put': 'change_cny_inland_delivery_fee',
})

change_order_fee_factor = OrderViewSet.as_view({
    'put': 'change_order_fee_factor',
})

change_purchase_code = OrderViewSet.as_view({
    'put': 'change_purchase_code',
})

change_status = OrderViewSet.as_view({
    'put': 'change_status',
})

bulk_approve = OrderViewSet.as_view({
    'put': 'bulk_approve',
})

get_order_items_for_checking = OrderViewSet.as_view({
    'get': 'get_order_items_for_checking',
})

check = OrderViewSet.as_view({
    'post': 'check',
})

complaint_resolve = OrderViewSet.as_view({
    'post': 'complaint_resolve',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = (
    path('', base),
    path('<int:pk>', pk),
    path('<int:pk>/change-sale/', change_sale),
    path('<int:pk>/change-cust-care/', change_cust_care),
    path('<int:pk>/change-rate/', change_rate),
    path('<int:pk>/change-address/', change_address),
    path('<int:pk>/change-count-check-fee-input/', change_count_check_fee_input),
    path('<int:pk>/change-cny-inland-delivery-fee/', change_cny_inland_delivery_fee),
    path('<int:pk>/change-order-fee-factor/', change_order_fee_factor),
    path('<int:pk>/change-purchase-code/', change_purchase_code),
    path('<int:pk>/change-status/', change_status),
    path('bulk-approve/', bulk_approve),
    path('get-order-items-for-checking/<str:uid>', get_order_items_for_checking),
    path('check/', check),
    path('complaint-resolve/', complaint_resolve),
)
