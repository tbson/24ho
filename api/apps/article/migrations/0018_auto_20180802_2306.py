# Generated by Django 2.0.7 on 2018-08-02 16:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('article', '0017_auto_20180802_2249'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='articletranslation',
            options={'default_permissions': (), 'ordering': ['-id']},
        ),
    ]
