# Generated by Django 2.2.5 on 2019-09-28 10:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transaction', '0015_auto_20190921_1012'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='type',
            field=models.IntegerField(choices=[(1, 'Nạp tiền'), (2, 'Đặt cọc đơn'), (3, 'Thanh toán đơn hàng'), (4, 'Rút tiền'), (5, 'Phí vận chuyển CN-VN'), (6, 'Phí vận chuyển nội địa VN'), (7, 'Phí bảo hiểm'), (8, 'Hoàn tiền khiếu nại'), (9, 'Hoàn tiền chiết khấu'), (10, 'Hoàn tiền huỷ đơn'), (11, 'Phụ phí khác')]),
        ),
    ]
