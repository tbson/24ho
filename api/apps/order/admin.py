from django.contrib import admin
from .models import Order

# Register your models here.
class OrderAdmin(admin.ModelAdmin):
    readonly_fields = ['uid']

admin.site.register(Order, OrderAdmin)
