# Generated by Django 2.2.3 on 2019-08-03 10:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('receipt', '0001_initial'),
        ('order', '0006_order_potential_bols'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='receipt',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='receipt_orders', to='receipt.Receipt'),
        ),
    ]
