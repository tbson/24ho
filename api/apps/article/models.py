from django.db import models
from utils.models.model import TimeStampedModel
from apps.category.models import Category
from django.core.exceptions import ValidationError
from .utils import ArticleUtils
# Create your models here.


class Article(TimeStampedModel):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='category', limit_choices_to={'type': "article"})
    title = models.CharField(max_length=250, unique=True)
    content = models.TextField()
    uid = models.CharField(max_length=250, unique=True)
    slug = models.CharField(max_length=250, blank=True)

    def save(self, *args, **kwargs):
        self.uid = ArticleUtils.create_slug(self.title)
        if self.slug is not None:
            self.slug = ArticleUtils.create_slug( self.slug)

        super(Article, self).save(*args, **kwargs)
        if not self.slug:
            self.slug = ArticleUtils.create_slug(self.title) + '-' + str(self.pk)
            super().save(*args, **kwargs)

    def __str__(self):
        return '{}'.format(self.title)

    class Meta:
        db_table = "articles"
        ordering = ['-id']
