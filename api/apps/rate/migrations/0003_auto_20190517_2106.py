# Generated by Django 2.2 on 2019-05-17 14:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('rate', '0002_auto_20190517_2103'),
    ]

    operations = [
        migrations.RenameField(
            model_name='rate',
            old_name='order_deta',
            new_name='order_delta',
        ),
    ]