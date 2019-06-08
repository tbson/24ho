# Generated by Django 2.2.2 on 2019-06-08 09:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('area', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeliveryFee',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.FloatField()),
                ('stop', models.FloatField()),
                ('vnd_unit_price', models.IntegerField()),
                ('type', models.IntegerField(choices=[(1, 'Mass'), (2, 'Volume')], default=1)),
                ('area', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='area_delivery_fees', to='area.Area')),
            ],
            options={
                'db_table': 'delivery_fees',
                'ordering': ['-stop'],
            },
        ),
    ]
