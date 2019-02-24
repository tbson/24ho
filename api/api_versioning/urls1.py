import os
from django.urls import path, include


app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = (
    path(
        'admin/',
        include('apps.administrator.urls', namespace='administrator'),
    ),
    path(
        'customer/',
        include('apps.customer.urls', namespace='customer'),
    ),
    path(
        'permission/',
        include('apps.permission.urls', namespace='permission'),
    ),
    path(
        'group/',
        include('apps.group.urls', namespace='group'),
    ),
    path(
        'variable/',
        include('apps.variable.urls', namespace='variable'),
    ),
    path(
        'category/',
        include('apps.category.urls', namespace='category'),
    ),
    path(
        'banner/',
        include('apps.banner.urls', namespace='banner'),
    ),
    path(
        'article/',
        include('apps.article.urls', namespace='article'),
    ),
    path(
        'attach/',
        include('apps.attach.urls', namespace='attach'),
    ),
    path(
        'tag/',
        include('apps.tag.urls', namespace='tag'),
    ),
)
