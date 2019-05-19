from django.db import models


# Create your models here.


class Category(models.Model):
    uid = models.CharField(max_length=60, unique=True)
    title = models.CharField(max_length=250)
    type = models.CharField(max_length=60)
    single = models.BooleanField(default=False)
    order = models.IntegerField(default=1)

    def save(self, *args, **kwargs):

        if self._state.adding:

            last_order = Category.objects.all().aggregate(
                largest=models.Max('order'))['largest']

            if last_order is not None:
                self.order = last_order + 1
            else:
                self.order = 1

        super(Category, self).save(*args, **kwargs)

    def __str__(self):
        return '{} - {}'.format(self.type, self.title)

    class Meta:
        db_table = "categories"
        ordering = ['-id']
