# Generated by Django 2.2.2 on 2019-06-08 13:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('address', '0002_address_customer'),
    ]

    operations = [
        migrations.AlterField(
            model_name='address',
            name='area',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='addresses', to='area.Area'),
        ),
    ]