# Generated by Django 2.2.3 on 2019-07-19 08:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bag', '0002_auto_20190717_0903'),
    ]

    operations = [
        migrations.AddField(
            model_name='bag',
            name='bol_date',
            field=models.IntegerField(null=True),
        ),
    ]
