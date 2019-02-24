from django.db import models


# Create your models here.
class Config(models.Model):
    uid = models.CharField(max_length=60, unique=True)
    value = models.CharField(max_length=250)

    def __str__(self):
        return '{} - {}'.format(self.uid, self.value)

    class Meta:
        db_table = "configs"
        ordering = ['-id']
        permissions = (
            ("list_config", "Can list config"),
            ("retrieve_config", "Can retrieve config"),
            ("delete_list_config", "Can delete list config"),
        )
