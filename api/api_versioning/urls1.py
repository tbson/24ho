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
)
