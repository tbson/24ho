from django.db import models
from django.conf import settings


class StaffManager(models.Manager):

    def getListSale(self):
        return self.filter(is_sale=True)

    def getListCustCare(self):
        return self.filter(is_cust_care=True)

    def getName(self, pk):
        try:
            item = self.get(pk=pk)
            return "{} {}".format(item.user.last_name, item.user.first_name)
        except Staff.DoesNotExist:
            return ''

# Create your models here.


class Staff(models.Model):

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

    is_sale = models.BooleanField(default=False)
    is_cust_care = models.BooleanField(default=False)
    is_lock = models.BooleanField(default=False)

    objects = StaffManager()

    def delete(self, *args, **kwargs):
        self.user.delete()
        return super().delete(*args, **kwargs)

    def __str__(self):
        return self.user.email

    class Meta:
        db_table = "staffs"
        ordering = ['-id']
