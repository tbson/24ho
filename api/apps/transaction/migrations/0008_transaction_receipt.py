# Generated by Django 2.2.3 on 2019-08-04 15:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('receipt', '0005_remove_receipt_vnd_total'),
        ('transaction', '0007_auto_20190729_1141'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='receipt',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='receipt_transactions', to='receipt.Receipt'),
        ),
    ]
