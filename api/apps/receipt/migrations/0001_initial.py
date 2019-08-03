# Generated by Django 2.2.3 on 2019-08-03 10:37

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('staff', '0001_initial'),
        ('customer', '0002_auto_20190714_1621'),
    ]

    operations = [
        migrations.CreateModel(
            name='Receipt',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('customer_username', models.CharField(blank=True, max_length=64)),
                ('staff_username', models.CharField(blank=True, max_length=64)),
                ('uid', models.CharField(max_length=60, unique=True)),
                ('type', models.IntegerField(choices=[(1, 'Order'), (2, 'Vận chuyển')], default=1)),
                ('vnd_sub_fee', models.IntegerField(default=0)),
                ('note', models.TextField(blank=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='customer_receipts', to='customer.Customer')),
                ('staff', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='staff_receipts', to='staff.Staff')),
            ],
            options={
                'db_table': 'receipts',
                'ordering': ['-id'],
            },
        ),
    ]