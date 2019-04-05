from django.db import models


# Create your models here.
class AreaCode(models.Model):
    uid = models.CharField(max_length=60, unique=True)
    title = models.CharField(max_length=250)
    unit_price = models.IntegerField(default=0)

    def __str__(self):
        return '{} - {}'.format(self.uid, self.title)

    class Meta:
        db_table = "area_codes"
        ordering = ['-id']
