# Generated by Django 2.2.4 on 2019-08-10 17:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transaction', '0009_auto_20190804_1647'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='type',
            field=models.IntegerField(choices=[(1, 'Nạp tiền'), (2, 'Đặt cọc đơn'), (3, 'Thanh toán đơn hàng'), (4, 'Rút tiền'), (5, 'Phí vận chuyển CN-VN'), (6, 'Phí vận chuyển nội địa VN'), (8, 'Hoàn tiền khiếu nại'), (10, 'Hoàn tiền chiết khấu'), (10, 'Hoàn tiền huỷ đơn'), (11, 'Phụ phí khác')]),
        ),
    ]
