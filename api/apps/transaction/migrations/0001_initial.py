# Generated by Django 2.2.3 on 2019-07-28 21:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('customer', '0002_auto_20190714_1621'),
        ('order', '0005_auto_20190728_1343'),
        ('staff', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('customer_uid', models.CharField(blank=True, max_length=64)),
                ('order_uid', models.CharField(blank=True, max_length=64)),
                ('uid', models.CharField(max_length=64, unique=True)),
                ('amount', models.FloatField()),
                ('type', models.IntegerField(choices=[(1, 'Nạp tiền'), (2, 'Đặt cọc đơn'), (3, 'Thanh toán đơn hàng'), (4, 'Rút tiền'), (5, 'Phí vận chuyển CN-VN'), (6, 'Phí vận chuyển nội địa VN'), (7, 'Hoàn tiền khiếu nại'), (9, 'Hoàn tiền chiết khấu'), (9, 'Hoàn tiền huỷ đơn'), (10, 'Phụ phí khác')])),
                ('money_type', models.IntegerField(choices=[(1, 'Nạp tiền'), (2, 'Đặt cọc đơn'), (3, 'Thanh toán đơn hàng'), (4, 'Rút tiền'), (5, 'Phí vận chuyển CN-VN'), (6, 'Phí vận chuyển nội địa VN'), (7, 'Hoàn tiền khiếu nại'), (9, 'Hoàn tiền chiết khấu'), (9, 'Hoàn tiền huỷ đơn'), (10, 'Phụ phí khác')])),
                ('note', models.TextField(blank=True)),
                ('customer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='customer_transactions', to='customer.Customer')),
                ('order', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='order_transactions', to='order.Order')),
                ('staff', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='staff_transactions', to='staff.Staff')),
            ],
            options={
                'db_table': 'transactions',
                'ordering': ['-id'],
            },
        ),
    ]
