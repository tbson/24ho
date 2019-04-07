from django.db import models
from django.conf import settings
from utils.helpers.test_helpers import TestHelpers


class StaffManager(models.Manager):

    def _seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from .serializers import StaffBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            user = TestHelpers.userSeeding(i, True)
            data = {
                "user": user.pk,
                "is_sale": i % 2 == 1,
                "is_cust_care": i % 2 == 0
            }

            if save is False:
                return data

            try:
                instance = self.get(user_id=user.pk)
            except Staff.DoesNotExist:
                instance = StaffBaseSr(data=data)
                instance.is_valid(raise_exception=True)
                instance = instance.save()
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

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
