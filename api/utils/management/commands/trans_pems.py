from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission


class Command(BaseCommand):
    help = 'Translate permissions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))
        basic_pems = {
            'add': 'Thêm',
            'change': 'Sửa',
            'delete': 'Xoá',
            'view': 'Xem'
        }
        apps = [
            'variable',
            'group',
            'permission',
            'role',
            'staff',
            'customer',
            'area',
            'address',
            'rate',
            'order',
            'orderitem',
            'orderfee',
            'deliveryfee',
            'countcheck',
            'bol',
            'boldate',
            'bag',
            'transaction',
            'receipt',
            'bank',
            'customerbank',
            'customergroup',
        ]
        for basic_pem in basic_pems.items():
            for app in apps:
                codename = "{}_{}".format(basic_pem[0], app)
                try:
                    permision = Permission.objects.get(codename=codename)
                    print("[+] {}".format(codename))
                    permision.name = basic_pem[1]
                    permision.save()
                except Permission.DoesNotExist:
                    pass
        self.stdout.write(self.style.SUCCESS('Done!!!'))
