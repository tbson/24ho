# Generated by Django 2.2.3 on 2019-07-04 07:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0004_bol_cny_sub_fee'),
    ]

    operations = [
        migrations.AddField(
            model_name='bol',
            name='checked',
            field=models.BooleanField(default=False),
        ),
    ]
