import os
from django.urls import path
from .views import (
    OrderViewSet,
    OrderViewSetIsAuthenticated
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

change_shockproof = OrderViewSet.as_view({
    'put': 'change_shockproof',
})

change_wooden_box = OrderViewSet.as_view({
    'put': 'change_wooden_box',
})

change_count_check = OrderViewSet.as_view({
    'put': 'change_count_check',
})

change_cny_real_amount = OrderViewSet.as_view({
    'put': 'change_cny_real_amount',
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

discard = OrderViewSet.as_view({
    'post': 'discard',
})

renew_discard = OrderViewSet.as_view({
    'post': 'renew_discard',
})

batch_update = OrderViewSet.as_view({
    'put': 'batch_update',
})

early_discard = OrderViewSetIsAuthenticated.as_view({
    'post': 'early_discard',
})

img_to_url = OrderViewSetIsAuthenticated.as_view({
    'post': 'img_to_url',
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
    path('<int:pk>/change-shockproof/', change_shockproof),
    path('<int:pk>/change-wooden-box/', change_wooden_box),
    path('<int:pk>/change-count-check/', change_count_check),
    path('<int:pk>/change-cny-real-amount/', change_cny_real_amount),
    path('<int:pk>/batch-update/', batch_update),
    path('bulk-approve/', bulk_approve),
    path('get-order-items-for-checking/<str:uid>', get_order_items_for_checking),
    path('check/', check),
    path('<int:pk>/complaint-resolve/', complaint_resolve),
    path('<int:pk>/discard/', discard),
    path('<int:pk>/early-discard/', early_discard),
    path('<int:pk>/renew-discard/', renew_discard),
    path('img-to-url/', img_to_url),
)
