from django.contrib import admin
from .models import Category

class CategoryAdmin(admin.ModelAdmin):
    readonly_fields = ['order']

# Register your models here.
admin.site.register(Category,CategoryAdmin)
