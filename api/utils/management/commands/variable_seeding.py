from django.core.management.base import BaseCommand
from apps.variable.utils import VariableUtils


class Command(BaseCommand):
    help = 'Append company info.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))

        VariableUtils.variable_seeding()

        self.stdout.write(self.style.SUCCESS('Done!!!'))
