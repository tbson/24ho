import os
from django.urls import path
from .views import (
    CategoryViewSet,
    CategoryLandingViewSet,
)


baseEndPoint = CategoryViewSet.as_view({
    'get': 'list',
    'post': 'add',
    'delete': 'delete_list'
})

pkEndpoint = CategoryViewSet.as_view({
    'get': 'retrieve',
    'put': 'change',
    'delete': 'delete'
})

translationPKEndPoint = CategoryViewSet.as_view({
    'put': 'change_translation',
})

landingEndPoint = CategoryLandingViewSet.as_view({
    'get': 'list'
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', baseEndPoint),
    path('<int:pk>', pkEndpoint),
    path('translation/<int:pk>', translationPKEndPoint),
    path('landing/', landingEndPoint),
]
