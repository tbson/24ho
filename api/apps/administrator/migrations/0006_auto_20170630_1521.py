# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-06-30 08:21
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('administrator', '0005_auto_20170630_1409'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='administrator',
            options={'ordering': ['-id'], 'permissions': (('view_list_administrator', 'Can view list administrators'), ('view_child_administrator', 'Can view child administrators'))},
        ),
    ]
