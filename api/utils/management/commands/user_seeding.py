from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from apps.staff.models import Staff
from apps.customer.models import Customer


class Command(BaseCommand):
    help = 'Create root, tbson (staff), sonnl (customer)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))

        admin = User.objects.create_user(
            username='admin',
            is_superuser=True,
            is_staff=True,
            email='admin@localhost',
            password='password'
        )
        # Grand all permission to this user
        permissions = Permission.objects.all()
        admin.user_permissions.set(permissions)
        Staff.objects.create(user=admin)

        user = User.objects.create_user(
            username='user',
            email='user@localhost',
            password='password'
        )
        Customer.objects.create(user=user)

        self.stdout.write(self.style.SUCCESS('Done!!!'))
