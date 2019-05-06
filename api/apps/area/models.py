from django.db import models


class AreaManager(models.Manager):
    def seeding(self, index: int, single: bool = False, save: bool = True) -> models.QuerySet:
        if index == 0:
            raise Exception('Indext must be start with 1.')

        def getData(i: int) -> dict:
            data = {
                'uid': "uid{}".format(i),
                'title': "title{}".format(i),
                'unit_price': 1000 + i
            }
            if save is False:
                return data

            try:
                return self.get(uid=data['uid'])
            except Area.DoesNotExist:
                return self.create(**data)

        def getListData(index):
            return [getData(i) for i in range(1, index + 1)]

        return getData(index) if single is True else getListData(index)

# Create your models here.


class Area(models.Model):
    uid = models.CharField(max_length=60, unique=True)
    title = models.CharField(max_length=250)
    unit_price = models.IntegerField(default=0)

    objects = AreaManager()

    def __str__(self):
        return '{} - {}'.format(self.uid, self.title)

    class Meta:
        db_table = "areas"
        ordering = ['-id']
