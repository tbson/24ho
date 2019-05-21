from django.core.management.base import BaseCommand
from apps.order.models import Order


class Command(BaseCommand):
    help = 'Re-calculate all orders.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))

        list_items = Order.objects.all()
        for item in list_items:
            Order.objects.re_cal(item)

        self.stdout.write(self.style.SUCCESS('Success!'))
