# Generated by Django 2.2.1 on 2019-05-30 15:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('article', '0002_auto_20190522_1007'),
    ]

    operations = [
        migrations.AddField(
            model_name='article',
            name='slug',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
