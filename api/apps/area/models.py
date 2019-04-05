from django.db import models
from apps.area_code.models import AreaCode


# Create your models here.
class Area(models.Model):
    area_code_id = models.ForeignKey(AreaCode, on_delete=models.CASCADE, related_name='area_code')
    address = models.CharField(max_length=250)
    phone = models.CharField(max_length=250, blank=True)
    fullname = models.CharField(max_length=250, blank=True)

    def __str__(self):
        return '{} - {}'.format(self.area_code, self.address)

    class Meta:
        db_table = "areas"
        ordering = ['-id']
