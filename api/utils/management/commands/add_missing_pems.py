from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import Permission
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

class Command(BaseCommand):
    help = 'Add missing permissions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Start...'))
        listPem = [
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
        contentTypeDict = {}
        contentTypeList = ContentType.objects.all();
        for contentType in contentTypeList:
            contentTypeDict[contentType.model] = contentType.id

        for pemData in listPem:
            pemData['content_type_id'] = contentTypeDict[pemData['content_type_id']]
            try:
                permission = Permission.objects.get(codename=pemData['codename'])
                # Update here
                permission.__dict__.update(params)
                permission.save()
            except Permission.DoesNotExist:
                # Create here
                permission = Permission(**pemData)
                permission.save();
        self.stdout.write(self.style.SUCCESS('Success!'))
