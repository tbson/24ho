# from django.core.management.base import BaseCommand, CommandError
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.bol.models import BolDate


class Command(BaseCommand):
    help = 'One time scripts'

    def _seeding_bol_date(self):
        self.stdout.write(self.style.SUCCESS('Start...'))
        now = timezone.now()
        for i in range(5, 30):
            item = BolDate(date=now - timezone.timedelta(days=i))
            item.save()

        self.stdout.write(self.style.SUCCESS('Done...'))

    def handle(self, *args, **options):
        self._seeding_bol_date()
