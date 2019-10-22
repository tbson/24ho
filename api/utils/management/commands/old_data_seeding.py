import math
from django.db import transaction
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.customer.models import Customer
from django.conf import settings
from pyexcel_xlsx import get_data
from apps.area.models import Area
from apps.address.models import Address


def sheetToList(sheet):
    result = []
    heading = sheet[0]
    for row in sheet[1:]:
        item = {}
        for index in range(0, len(heading)):
            item[heading[index]] = row[index]
        result.append(item)
    return result


class Command(BaseCommand):
    help = 'Create root, tbson (staff), sonnl (customer)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))
        with transaction.atomic():
            excel_path = settings.MEDIA_ROOT + 'bak.xlsx'
            data = get_data(excel_path)
            customers = sheetToList(data.get('customers'))
            customer_pk_map = {}

            areas = sheetToList(data.get('areas'))
            area_pk_map = {}

            addresses = sheetToList(data.get('addresses'))

            counter = 0
            for customer_data in customers:
                email = customer_data['email'].lower().strip()
                first_name = customer_data['first_name']
                last_name = customer_data['last_name']
                print("{}% customer: {}".format(math.ceil(counter * 100 / len(customers)), email))
                try:
                    user = User.objects.get(username=email)
                except (User.DoesNotExist, User.MultipleObjectsReturned):
                    user = User.objects.create_user(
                        username=email,
                        email=email,
                        password=email,
                        first_name=first_name,
                        last_name=last_name,
                    )
                    customer = Customer.objects.create(user=user, phone=customer_data['phone'])
                    customer_pk_map[customer_data['id']] = customer.pk
                counter = counter + 1
            # print(customer_pk_map)

            counter = 0
            for area_data in areas:
                uid = area_data['uid'].upper().strip()
                title = area_data['title']
                unit_price = int(area_data['unit_price'])
                print("{}% area: {}".format(math.ceil(counter * 100 / len(areas)), uid))
                try:
                    area = Area.objects.get(uid=uid)
                except (Area.DoesNotExist, Area.MultipleObjectsReturned):
                    area = Area.objects.create(
                        uid=uid,
                        title=title,
                        unit_price=unit_price
                    )
                area_pk_map[area_data['id']] = area.pk
                counter = counter + 1
            # print(area_pk_map)

            counter = 0
            for address_data in addresses:
                customer_id = customer_pk_map.get(address_data['customer_id'], None)
                area_id = area_pk_map.get(address_data['area_id'], None)
                uid = address_data['uid'].upper().strip()
                if not customer_id or not area_id:
                    continue
                data = {
                    'customer_id': customer_id,
                    'area_id': area_id,
                    'uid': uid,
                    'title': address_data['title'],
                    'default': True
                }
                print("{}% address: {}".format(math.ceil(counter * 100 / len(areas)), uid))
                try:
                    Address.objects.get(uid=uid)
                except (Address.DoesNotExist, Address.MultipleObjectsReturned):
                    Address.objects.create(**data)
                counter = counter + 1

            # self.stdout.write(self.style.SUCCESS('Done!!!'))
            # transaction.rollback()

        self.stdout.write(self.style.SUCCESS('Done!!!'))
