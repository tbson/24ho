from django.db import models
from model_utils.models import TimeStampedModel
from apps.category.models import Category
# Create your models here.


class Article(TimeStampedModel):
    title = models.CharField(max_length=100)
    content = models.TextField()
    uid = models.CharField(max_length=50, unique=True)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='category')

    def __str__(self):
        return '{} - {}'.format(self.article, self.title)

    class Meta:
        db_table = "articles"
        ordering = ['-id']
