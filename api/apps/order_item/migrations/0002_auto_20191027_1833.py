# Generated by Django 2.2.6 on 2019-10-27 18:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('order_item', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='orderitem',
            options={'ordering': ['-id'], 'permissions': (('change_color_orderitem', 'Đổi màu'), ('change_size_orderitem', 'Đổi size'), ('change_quantity_orderitem', 'Đổi số lượng'), ('change_unit_price_orderitem', 'Đổi đơn giá'), ('change_note_orderitem', 'Đổi ghi chú'))},
        ),
    ]
