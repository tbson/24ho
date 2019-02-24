from django.core.management.base import BaseCommand, CommandError
from utils.helpers.tools import Tools

class Command(BaseCommand):
    help = 'Test function'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))
        path = 'hello/tes/a.b/abc.def.jpg'
        self.stdout.write(Tools.getThumbnail(path))
        self.stdout.write(self.style.SUCCESS('Success!'))
