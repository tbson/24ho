# Generated by Django 2.2.6 on 2019-10-27 18:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0016_order_cny_real_amount'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='order',
            options={'ordering': ['-id'], 'permissions': (('change_sale_order', 'Đổi nhân viên mua hàng'), ('change_cust_care_order', 'Đổi nhân viên chăm sóc'), ('change_rate_order', 'Đổi tỷ giá'), ('change_address_order', 'Đổi địa chỉ'), ('change_voucher_order', 'Đổi voucher'), ('change_count_check_fee_input_order', 'Đổi giá kiểm kếm'), ('change_cny_inland_delivery_fee_order', 'Đổi phí vận chuyển nội địa'), ('change_order_fee_factor_order', 'Đổi hệ số phí dịch vụ'), ('change_purchase_code_order', 'Đổi mã giao dịc'), ('change_status_order', 'Đổi trạng thái'), ('change_shockproof_order', 'Đổi trạng thái chống sốc'), ('change_wooden_box_order', 'Đổi trạng thái đóng gỗ'), ('change_count_check_order', 'Đổi trạng thái kiểm đếm'), ('change_cny_real_amount_order', 'Đổi thanh toán thực'), ('bulk_approve_order', 'Duyệt đơn'), ('get_order_items_for_checking_order', 'Kiểm hàng chi tiết'), ('check_order', 'Kiểm hàng'), ('complaint_resolve_order', 'Giải quyết khiếu nại'), ('discard_order', 'Huỷ đơn'), ('batch_update', 'Sửa hàng loạt'))},
        ),
    ]
