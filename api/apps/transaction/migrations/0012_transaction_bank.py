# Generated by Django 2.2.4 on 2019-09-02 09:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bank', '0001_initial'),
        ('transaction', '0011_auto_20190826_1444'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='bank',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='bank_transactions', to='bank.Bank'),
        ),
    ]
