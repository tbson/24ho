# Generated by Django 2.2.3 on 2019-08-04 09:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0013_auto_20190804_0838'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='bol',
            options={'ordering': ['-id'], 'permissions': (('change_bag_bol', 'Can change bag'), ('get_date_bol', 'Can get date'), ('match_vn_bol', 'Can get match VN bol'), ('ready_to_export_list_bol', 'Can get bol to export'), ('export_bol', 'Can check before export'))},
        ),
    ]
