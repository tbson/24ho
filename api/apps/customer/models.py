from django.db import models
from django.conf import settings
from apps.administrator.models import Administrator


# Create your models here.
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

    sale_id = models.ForeignKey(Administrator, models.SET_NULL, related_name='sale', blank=True, null=True)
    cust_care_id = models.ForeignKey(Administrator, models.SET_NULL, related_name='cust_care', blank=True, null=True)

    is_lock = models.BooleanField(default=False)

    def delete(self, *args, **kwargs):
        self.user.delete()
        return super().delete(*args, **kwargs)

    def __str__(self):
        return self.user.email

    class Meta:
        db_table = "customers"
        ordering = ['-id']
