# Generated by Django 2.1.7 on 2019-02-24 08:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('banner', '0008_auto_20180802_2320'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='banner',
            options={'ordering': ['-id'], 'permissions': (('change_translation_banner', 'Can change translation banner'),)},
        ),
    ]
