import os
import uuid
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.conf import settings
from apps.staff.models import Staff
from utils.helpers.tools import Tools
from utils.helpers.test_helpers import TestHelpers

# Create your models here.


def imgDest(instance, filename):
    return os.path.join('member', "{}.{}".format(uuid.uuid4(), 'jpg'))


class CustomerManager(models.Manager):
    def _seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import CustomerBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            user = TestHelpers.userSeeding(i, True)
            data = {
                "user": user.pk,
                "phone": "00{}".format(i),
            }

            if save is False:
                return data

            try:
                instance = self.get(user_id=user.pk)
            except Customer.DoesNotExist:
                instance = CustomerBaseSr(data=data)
                instance.is_valid(raise_exception=True)
                instance = instance.save()
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)


class Customer(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    fingerprint = models.CharField(max_length=250, blank=True)

    reset_password_token = models.CharField(max_length=250, blank=True)
    reset_password_tmp = models.CharField(max_length=250, blank=True)
    reset_password_created = models.DateTimeField(null=True, blank=True)

    signup_token = models.CharField(max_length=250, blank=True)
    signup_token_created = models.DateTimeField(null=True, blank=True)

    phone = models.CharField(max_length=32)
    company = models.CharField(max_length=256, blank=True)

    sale = models.ForeignKey(Staff, models.SET_NULL, related_name='sale', blank=True, null=True)
    cust_care = models.ForeignKey(Staff, models.SET_NULL, related_name='cust_care', blank=True, null=True)

    order_fee_factor = models.FloatField(default=10)
    delivery_fee_unit_price = models.IntegerField(default=0)
    deposit_factor = models.FloatField(default=50)
    complaint_days = models.IntegerField(default=2)

    is_lock = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to=imgDest, blank=True)
    shopping_cart = JSONField(default=dict)

    objects = CustomerManager()

    def save(self, *args, **kwargs):

        if not self._state.adding:
            item = Customer.objects.get(pk=self.pk)
            if item.avatar and item.avatar and hasattr(item.avatar, 'url'):
                if self.avatar and item.avatar != self.avatar:
                    Tools.removeFile(item.avatar.path, True)
        super(Customer, self).save(*args, **kwargs)

        if self.avatar and hasattr(self.avatar, 'url'):
            Tools.scaleImage(1, self.avatar.path)

    def delete(self, *args, **kwargs):
        self.user.delete()
        if self.avatar:
            Tools.removeFile(self.avatar.path, True)
        return super().delete(*args, **kwargs)

    def __str__(self):
        return self.user.email

    class Meta:
        db_table = "customers"
        ordering = ['-id']
