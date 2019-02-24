import os
from django.urls import path
from . import views


app_name = os.getcwd().split(os.sep)[-1]
urlpatterns = [
    path('', views.home, name='home'),
    path('lien-he', views.contact, name='contact'),
    path('danh-sach-bai-viet/<str:category_uid>', views.article_list, name='article_list'),
    path('bai-viet/<str:category_uid>', views.article_detail, name='article_detail'),
    path('bai-viet/<int:pk>/<str:category_uid>', views.article_detail_pk, name='article_detail_pk'),
]
