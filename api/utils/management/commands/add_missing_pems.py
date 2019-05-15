from django.core.management.base import BaseCommand
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = 'Add missing permissions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))
        list_pem = [
            {
                'content_type_id': 'group',
                'codename': 'view_group_list',
                'name': 'Can view group list',
            },
            {
                'content_type_id': 'group',
                'codename': 'view_group_detail',
                'name': 'Can view group detail',
            },
            {
                'content_type_id': 'permission',
                'codename': 'view_permission_list',
                'name': 'Can view permission list',
            },
            {
                'content_type_id': 'permission',
                'codename': 'view_permission_detail',
                'name': 'Can view permission detail',
            },
        ]
        content_type_dict = {}
        content_type_list = ContentType.objects.all()
        for content_type in content_type_list:
            content_type_dict[content_type.model] = content_type.id

        for pem_data in list_pem:
            pem_data['content_type_id'] = content_type_dict[pem_data['content_type_id']]
            try:
                permission = Permission.objects.get(codename=pem_data['codename'])
                # Update here
                permission.__dict__.update(permission)
                permission.save()
            except Permission.DoesNotExist:
                # Create here
                permission = Permission(**pem_data)
                permission.save()
        self.stdout.write(self.style.SUCCESS('Success!'))
