# Generated by Django 2.0 on 2018-01-16 11:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('administrator', '0014_auto_20180106_2203'),
    ]

    operations = [
        migrations.AlterField(
            model_name='administrator',
            name='change_password_created',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='administrator',
            name='signup_token_created',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
