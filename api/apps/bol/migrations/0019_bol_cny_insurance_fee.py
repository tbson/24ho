# Generated by Django 2.2.4 on 2019-08-10 17:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0018_bol_vnd_delivery_fee'),
    ]

    operations = [
        migrations.AddField(
            model_name='bol',
            name='cny_insurance_fee',
            field=models.FloatField(default=0),
        ),
    ]