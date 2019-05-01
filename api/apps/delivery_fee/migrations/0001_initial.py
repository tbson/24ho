# Generated by Django 2.2 on 2019-05-01 08:34

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DeliveryFee',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('from_mass', models.IntegerField()),
                ('to_mass', models.IntegerField()),
                ('fee', models.IntegerField()),
            ],
            options={
                'db_table': 'delivery_fees',
                'ordering': ['-to_mass'],
            },
        ),
    ]