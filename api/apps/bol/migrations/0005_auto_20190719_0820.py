# Generated by Django 2.2.3 on 2019-07-19 01:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0004_auto_20190719_0737'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='bol',
            options={'ordering': ['-id'], 'permissions': (('get_order_items_for_checking_bol', 'Can get order items for checking from bol'), ('change_bag_bol', 'Can change bag'))},
        ),
    ]
