# Generated by Django 2.2.3 on 2019-08-04 15:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('receipt', '0004_auto_20190804_1453'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='receipt',
            name='vnd_total',
        ),
    ]
