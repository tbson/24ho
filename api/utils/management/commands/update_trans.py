from django.core.management.base import BaseCommand
from apps.banner.models import Banner
from apps.article.models import Article
from apps.category.models import Category


class Command(BaseCommand):
    help = 'Add missing permissions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))

        list_banner = Banner.objects.all()
        for banner in list_banner:
            Banner.objects.addTranslations(banner)

        list_article = Article.objects.all()
        for article in list_article:
            Article.objects.addTranslations(article)

        list_category = Category.objects.all()
        for category in list_category:
            Category.objects.addTranslations(category)

        self.stdout.write(self.style.SUCCESS('Success!'))
