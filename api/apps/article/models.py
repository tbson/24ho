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

    def save(self, *args, **kwargs):
        self.uid = self.title.replace(' ','-')
        
        super(Article, self).save(*args, **kwargs)

    def clean(self): 
        if self.category_id is not None:
            if(self.category.single == True):
                if (Article.objects.filter(category__id = self.category_id).exists()):
                    if(self.uid is None) :
                        raise ValidationError("Can only create 1 instance of articles when category'single is true.")
                    else:
                        

    def __str__(self):
        return '{}'.format(self.title)

    class Meta:
        db_table = "articles"
        ordering = ['-id']
