from django.db import models
from utils.models.model import TimeStampedModel


# Create your models here.
class Tag(TimeStampedModel):
    title = models.CharField(max_length=256)
    uid = models.CharField(max_length=256, unique=True)

    def __str__(self):
        return '{}'.format(self.title)

    class Meta:
        db_table = "tags"
        ordering = ['-id']
