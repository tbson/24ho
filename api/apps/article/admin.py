from django.contrib import admin
from .models import Article


class ArticleAdmin(admin.ModelAdmin):
    readonly_fields = ['uid']


# Register your models here.
admin.site.register(Article, ArticleAdmin)
