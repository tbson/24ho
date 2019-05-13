from django.db import models


class CategoryManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        from apps.category.serializers import CategoryBaseSr
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            data = {
                'uid': "uid{}".format(i),
                'title': "title{}".format(i),
                'type': "type{}".format(i),
                'single': i % 2 == 0,
                'order': 100 + i,
            }
            if save is False:
                return data

            instance = CategoryBaseSr(data=data)
            instance.is_valid(raise_exception=True)
            instance = instance.save()
            return instance

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

# Create your models here.


class Category(models.Model):
    uid = models.CharField(max_length=60, unique=True)
    title = models.CharField(max_length=250)
    type = models.CharField(max_length=60)
    single = models.BooleanField(default=False)
    order = models.IntegerField(default=1)

    objects = CategoryManager()
    def save(self, *args, **kwargs):

        if self._state.adding:

            last_order = Category.objects.all().aggregate(
                largest=models.Max('order'))['largest']

            if last_order is not None:
                self.order = last_order + 1

        super(Category, self).save(*args, **kwargs)

    def __str__(self):
        return '{} - {}'.format(self.type, self.title)

    class Meta:
        db_table = "categories"
        ordering = ['-id']
