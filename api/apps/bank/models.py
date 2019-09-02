from django.db import models


# Create your models here.
class Bank(models.Model):
    uid = models.CharField(max_length=64, unique=True)
    title = models.CharField(max_length=256)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "banks"
        ordering = ['-id']
