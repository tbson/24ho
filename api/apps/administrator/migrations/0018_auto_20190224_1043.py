# Generated by Django 2.1.7 on 2019-02-24 03:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('administrator', '0017_auto_20180331_0956'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='administrator',
            options={'ordering': ['-id'], 'permissions': (('retrieve_administrator', 'Can retrieve administrator'),)},
        ),
    ]
