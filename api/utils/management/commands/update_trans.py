from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from apps.banner.models import Banner
from apps.article.models import Article
from apps.category.models import Category


class Command(BaseCommand):
    help = 'Add missing permissions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))

        listBanner = Banner.objects.all()
        for banner in listBanner:
            Banner.objects.addTranslations(banner)

        listArticle = Article.objects.all()
        for article in listArticle:
            Article.objects.addTranslations(article)

        listCategory = Category.objects.all()
        for category in listCategory:
            Category.objects.addTranslations(category)

        self.stdout.write(self.style.SUCCESS('Success!'))
