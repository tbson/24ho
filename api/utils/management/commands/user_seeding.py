from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from django.contrib.auth.models import User
from apps.staff.models import Staff
from apps.customer.models import Customer
from apps.variable.utils import VariableUtils


class Command(BaseCommand):
    help = 'Create root, tbson (staff), sonnl (customer)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))
        staffs = [
            {
                'username': 'admin',
                'email': 'admin@localhost.com',
                'first_name': 'john',
                'last_name': 'doe',
                'password': 'password',
                'is_superuser': True,
                'is_staff': True
            },
            {
                'username': 'admin1',
                'email': 'admin1@localhost.com',
                'first_name': 'jim',
                'last_name': 'colin',
                'password': 'password',
                'is_superuser': True,
                'is_staff': True
            }
        ]
        for staff_data in staffs:
            try:
                User.objects.get(email=staff_data['email'])
            except User.DoesNotExist:
                print("[+] Creating admin: {}".format(staff_data['username']))
                user = User.objects.create_user(**staff_data)
                # Grand all permission to this user
                permissions = Permission.objects.all()
                user.user_permissions.set(permissions)
                Staff.objects.create(user=user)

        customers = [
            {
                'username': 'user',
                'email': 'user@localhost.com',
                'first_name': 'john',
                'last_name': 'doe',
                'password': 'password'
            },
            {
                'username': 'user1',
                'email': 'user1@localhost.com',
                'first_name': 'jim',
                'last_name': 'colin',
                'password': 'password'
            }
        ]
        for customer_data in customers:
            try:
                User.objects.get(email=customer_data['email'])
            except User.DoesNotExist:
                print("[+] Creating customer: {}".format(customer_data['username']))
                user = User.objects.create_user(**customer_data)
                Customer.objects.create(user=user)

        VariableUtils.variable_seeding()

        self.stdout.write(self.style.SUCCESS('Done!!!'))
