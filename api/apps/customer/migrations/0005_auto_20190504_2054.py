# Generated by Django 2.2 on 2019-05-04 13:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0004_auto_20190430_0927'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customer',
            old_name='delivery_fee_unit_price',
            new_name='delivery_fee_mass_unit_price',
        ),
        migrations.AddField(
            model_name='customer',
            name='delivery_fee_volume_unit_price',
            field=models.IntegerField(default=0),
        ),
    ]
