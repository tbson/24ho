from django.db import models
from django.utils.text import slugify
from django.conf import settings


class CategoryManager(models.Manager):
    def addTranslations(self, category):
        for lang in settings.LANGUAGES:
            translationData = {
                "category": category,
                "lang": lang
            }
            translation = CategoryTranslation(**translationData)
            translation.save()

    def getTitleFromUid(self, uid, lang):
        try:
            from .serializers import CategoryTranslationListSerializer
            item = CategoryTranslationListSerializer(self.get(uid=uid), context={'lang': lang})
            return item.data['title']
        except Category.DoesNotExist:
            return uid


class Category(models.Model):
    uid = models.CharField(max_length=256, unique=True)
    title = models.CharField(max_length=256, unique=True)
    type = models.CharField(max_length=50)
    image_ratio = models.FloatField(default=1.618)
    width_ratio = models.IntegerField(default=100)
    single = models.BooleanField(default=False)
    objects = CategoryManager()

    def __str__(self):
        return '{}'.format(self.title)

    def save(self, *args, **kwargs):
        self.uid = slugify(self.title)
        super(Category, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        for banner in self.banners.all():
            banner.delete()
        for article in self.articles.all():
            article.delete()
        super(Category, self).delete(*args, **kwargs)

    class Meta:
        db_table = "categories"
        ordering = ['-id']
        permissions = (
            ("change_translation_category", "Can change translation category"),
        )


class CategoryTranslation(models.Model):
    category = models.ForeignKey(Category, related_name="category_translations", on_delete=models.CASCADE)
    lang = models.CharField(max_length=5)
    title = models.CharField(blank=True, max_length=256)

    class Meta:
        db_table = "category_translations"
        ordering = ['-id']
        default_permissions = ()
