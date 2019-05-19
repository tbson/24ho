from django.db import models


# Create your models here.


class CountCheck(models.Model):
    from_items = models.IntegerField()
    to_items = models.IntegerField()
    fee = models.FloatField()

    def __str__(self):
        return '{} - {}'.format(self.from_items, self.to_items)

    class Meta:
        db_table = "count_checks"
        ordering = ['-to_items']
