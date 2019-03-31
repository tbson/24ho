import os
import sys

from django.db import models
from django.conf import settings
from apps.staff.models import Staff
from utils.helpers.tools import Tools

# Create your models here.


def imgDest(instance, filename):
    return os.path.join('member', "{}.{}".format(uuid.uuid4(), 'jpg'))


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

    sale_id = models.ForeignKey(Staff, models.SET_NULL, related_name='sale', blank=True, null=True)
    cust_care_id = models.ForeignKey(Staff, models.SET_NULL, related_name='cust_care', blank=True, null=True)

    is_lock = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to=imgDest, blank=True)

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
