# Generated by Django 2.2.3 on 2019-07-10 05:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0009_bol_bol_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bol',
            name='bol_date',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='date_bols', to='bol.BolDate'),
        ),
    ]