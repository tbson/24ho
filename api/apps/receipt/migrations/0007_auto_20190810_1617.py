# Generated by Django 2.2.4 on 2019-08-10 16:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('receipt', '0006_receipt_vnd_total'),
    ]

    operations = [
        migrations.RenameField(
            model_name='receipt',
            old_name='vnd_other_sub_fee',
            new_name='vnd_delivery_fee',
        ),
    ]
