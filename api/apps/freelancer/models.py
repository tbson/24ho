from django.db import models
from django.conf import settings


# Create your models here.
class Freelancer(models.Model):

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
        db_table = "freelancers"
        ordering = ['-id']
        permissions = (
            ("view_freelancer_list", "Can view freelancer list"),
            ("view_freelancer_detail", "Can view freelancer detail"),
            ("view_freelancer_profile", "Can view freelancer profile"),
        )
