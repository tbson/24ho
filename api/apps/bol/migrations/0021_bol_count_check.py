# Generated by Django 2.2.5 on 2019-09-14 14:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0020_auto_20190903_1344'),
    ]

    operations = [
        migrations.AddField(
            model_name='bol',
            name='count_check',
            field=models.BooleanField(default=False),
        ),
    ]
