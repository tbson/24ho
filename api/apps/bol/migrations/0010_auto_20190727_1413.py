# Generated by Django 2.2.3 on 2019-07-27 14:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0009_remove_bol_checked'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='bol',
            options={'ordering': ['-id'], 'permissions': (('change_bag_bol', 'Can change bag'), ('get_date_bol', 'Can get date'), ('match_vn_bol', 'Can get match VN bol'))},
        ),
    ]
