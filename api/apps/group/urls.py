import os
from django.urls import path
from .views import (
    GroupViewSet,
)


baseEndPoint = GroupViewSet.as_view({
    'get': 'list',
})

pkEndpoint = GroupViewSet.as_view({
    'get': 'retrieve',
})

app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', baseEndPoint),
    path('<int:pk>', pkEndpoint),
]
