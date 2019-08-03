import os
from django.urls import path, include


app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = (
    path(
        'group/',
        include('apps.group.urls', namespace='group'),
    ),
    path(
        'staff/',
        include('apps.staff.urls', namespace='staff'),
    ),
    path(
        'customer/',
        include('apps.customer.urls', namespace='customer'),
    ),
    path(
        'variable/',
        include('apps.variable.urls', namespace='variable'),
    ),
    path(
        'area/',
        include('apps.area.urls', namespace='area'),
    ),
    path(
        'address/',
        include('apps.address.urls', namespace='address'),
    ),
    path(
        'rate/',
        include('apps.rate.urls', namespace='rate'),
    ),
    path(
        'order/',
        include('apps.order.urls', namespace='order'),
    ),
    path(
        'order-item/',
        include('apps.order_item.urls', namespace='order_item'),
    ),
    path(
        'order-fee/',
        include('apps.order_fee.urls', namespace='order_fee'),
    ),
    path(
        'delivery-fee/',
        include('apps.delivery_fee.urls', namespace='delivery_fee'),
    ),
    path(
        'count-check/',
        include('apps.count_check.urls', namespace='count_check'),
    ),
    path(
        'bol/',
        include('apps.bol.urls', namespace='bol'),
    ),
    path(
        'bag/',
        include('apps.bag.urls', namespace='bag'),
    ),
    path(
        'transaction/',
        include('apps.transaction.urls', namespace='transaction'),
    ),
    path(
        'receipt/',
        include('apps.receipt.urls', namespace='receipt'),
    ),
    path(
        'category/',
        include('apps.category.urls', namespace='category'),
    ),
    path(
        'article/',
        include('apps.article.urls', namespace='article'),
    ),
)
