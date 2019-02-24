from django.http import Http404
from django.shortcuts import render
from django.conf import settings

from apps.banner.models import Banner
from apps.article.models import Article


meta = {
    'title': '',
    'description': '',
    'image': ''
}


def home(request):
    data = {}
    data['META'] = settings.DEFAULT_META
    return render(request, 'base.html', data)


def article_list(request, category_uid):
    return render(request, 'base.html', {})


def article_detail(request, category_uid):
    item = Article.objects.filter(category__uid=category_uid).first()
    if item is not None:
        meta['title'] = item.title
        meta['description'] = item.description
        meta['image'] = item.image
    data = {}
    data['META'] = meta
    return render(request, 'base.html', data)


def article_detail_pk(request, pk, category_uid):
    try:
        item = Article.objects.get(pk=pk)
        meta['title'] = item.title
        meta['description'] = item.description
        meta['image'] = item.image
    except Article.DoesNotExist:
        pass
    data = {}
    data['META'] = meta
    return render(request, 'base.html', data)


def contact(request):
    return render(request, 'base.html', {})
