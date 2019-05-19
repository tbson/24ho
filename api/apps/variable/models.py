from django.db import models


# Create your models here.
class Variable(models.Model):
    uid = models.CharField(max_length=60, unique=True)
    value = models.CharField(max_length=250)

    def __str__(self):
        return '{} - {}'.format(self.uid, self.value)

    class Meta:
        db_table = "variables"
        ordering = ['-id']
