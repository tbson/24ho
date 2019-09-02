from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from apps.staff.models import Staff
from apps.customer.models import Customer
from apps.variable.models import Variable


class Command(BaseCommand):
    help = 'Create root, tbson (staff), sonnl (customer)'

    @staticmethod
    def variable_seeding():
        list_item = [
            {'uid': 'info-ten-cty', 'value': 'SAMPLE'},
            {'uid': 'info-dia-chi', 'value': 'SAMPLE'},
            {'uid': 'info-email', 'value': 'SAMPLE'},
            {'uid': 'info-phone', 'value': 'SAMPLE'},
            {'uid': 'info-website', 'value': 'SAMPLE'},
        ]
        for item in list_item:
            try:
                Variable.objects.get(uid=item['uid'])
            except Variable.DoesNotExist:
                new_item = Variable(**item)
                new_item.save()

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))

        admin = User.objects.create_user(
            username='admin',
            is_superuser=True,
            is_staff=True,
            email='admin@localhost.com',
            password='password',
            first_name='admin',
            last_name='1',
        )
        # Grand all permission to this user
        permissions = Permission.objects.all()
        admin.user_permissions.set(permissions)
        Staff.objects.create(user=admin)

        user = User.objects.create_user(
            username='user',
            email='user@localhost.com',
            password='password',
            first_name='user',
            last_name='1',
        )
        Customer.objects.create(user=user)

        Command.variable_seeding()

        self.stdout.write(self.style.SUCCESS('Done!!!'))
