# Generated by Django 2.2.5 on 2019-09-21 10:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0010_auto_20190915_1344'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='vnd_amount',
            field=models.FloatField(default=0),
        ),
    ]
