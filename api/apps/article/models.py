from django.db import models
from utils.models.model import TimeStampedModel
from apps.category.models import Category
from django.core.exceptions import ValidationError
# Create your models here.


class Article(TimeStampedModel):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='category', limit_choices_to={'type': "article"}, null=False,)
    title = models.CharField(max_length=100, unique=True)
    content = models.TextField()
    uid = models.CharField(max_length=50, unique=True)
    slug = models.CharField(max_length=50, blank=True)

    def save(self, *args, **kwargs):
        self.uid = self.title.replace(' ', '-')
        if self.slug is not None:
            self.slug = self.slug.replace(' ', '-')

        if self.category_id is not None:
            if(self.category.single == True):
                if (Article.objects.filter(category__id=self.category_id).exists()):
                    if(self.uid is None):
                        raise ValidationError(
                            "Can only create 1 instance of articles when category'single is true.")
                    else:
                        if(Article.objects.filter(category__id=self.category_id)[0].uid != self.uid):
                            raise ValidationError(
                                "Can only create 1 instance of articles when category'single is true.")


        super(Article, self).save(*args, **kwargs)
        if not self.slug:
            self.slug = self.title.replace(' ', '-') + '-' + str(self.pk)
            super(Article, self).save(*args, **kwargs)

    # def clean(self):
    #     if self.category_id is not None:
    #         if(self.category.single == True):
    #             if (Article.objects.filter(category__id=self.category_id).exists()):
    #                 if(self.uid is None):
    #                     raise ValidationError(
    #                         "Can only create 1 instance of articles when category'single is true.")
    #                 else:
    #                     if(Article.objects.filter(category__id=self.category_id)[0].uid != self.uid):
    #                         raise ValidationError(
    #                             "Can only create 1 instance of articles when category'single is true.")

    def __str__(self):
        return '{}'.format(self.title)

    class Meta:
        db_table = "articles"
        ordering = ['-id']
