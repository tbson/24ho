from django.db import models
from django.conf import settings


# Create your models here.
class Administrator(models.Model):

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

    def delete(self, *args, **kwargs):
        self.user.delete()
        return super().delete(*args, **kwargs)

    def __str__(self):
        return self.user.email

    class Meta:
        db_table = "administrators"
        ordering = ['-id']
        permissions = (
            ("view_administrator_list", "Can view administrator list"),
            ("view_administrator_detail", "Can view administrator detail"),
            ("view_administrator_profile", "Can view administrator profile"),
        )
