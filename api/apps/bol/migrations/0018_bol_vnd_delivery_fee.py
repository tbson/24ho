# Generated by Django 2.2.4 on 2019-08-10 15:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0017_bol_exporter'),
    ]

    operations = [
        migrations.AddField(
            model_name='bol',
            name='vnd_delivery_fee',
            field=models.IntegerField(default=0),
        ),
    ]
