# Generated by Django 2.2.3 on 2019-07-07 09:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0009_auto_20190704_1404'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='pending',
            field=models.BooleanField(default=False),
        ),
    ]