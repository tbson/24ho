from django.db import models


# Create your models here.
class CustomerGroup(models.Model):
    uid = models.CharField(max_length=256, unique=True)

    def __str__(self):
        return '{} - {}'.format(self.uid, self.value)

    class Meta:
        db_table = "customer_groups"
        ordering = ['-id']
