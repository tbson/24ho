# Generated by Django 2.2.3 on 2019-07-27 14:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0002_auto_20190714_1621'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='order',
            options={'ordering': ['-id'], 'permissions': (('change_sale_order', 'Can change sale'), ('change_cust_care_order', 'Can change customer care'), ('change_rate_order', 'Can change rate'), ('change_address_order', 'Can change address'), ('change_voucher_order', 'Can change voucher'), ('change_count_check_fee_input_order', 'Can change count check fee'), ('change_cny_inland_delivery_fee_order', 'Can change inland delivery fee'), ('change_order_fee_factor_order', 'Can change order fee factor'), ('change_purchase_code_order', 'Can change purchase code'), ('change_status_order', 'Can change status'), ('bulk_approve_order', 'Can bulk approve'), ('get_order_items_for_checking_bol', 'Can get order items for checking from bol'), ('check_order', 'Can check order'))},
        ),
    ]
