from django.db import models
from utils.models.model import TimeStampedModel
from apps.category.models import Category
# Create your models here.


class Article(TimeStampedModel):
    title = models.CharField(max_length=100, unique=True)
    content = models.TextField()
    uid = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='title', limit_choices_to={'type': "article"},)

    def save(self, *args, **kwargs):

        # if self._state.adding:
            # self.category['single'] == True

        #self.uid = self.title.replace(' ', '-')
        self.uid =  self.category

        super(Article, self).save(*args, **kwargs)

    def __str__(self):
        return '{}'.format(self.title)

    class Meta:
        db_table = "articles"
        ordering = ['-id']
