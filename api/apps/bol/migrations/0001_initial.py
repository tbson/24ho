# Generated by Django 2.2.2 on 2019-06-08 09:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('address', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bol',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('uid', models.CharField(max_length=60, unique=True)),
                ('purchase_code', models.CharField(blank=True, max_length=60)),
                ('address_code', models.CharField(blank=True, max_length=60)),
                ('landing_status', models.IntegerField(choices=[(1, 'Mới'), (2, 'Về TQ'), (3, 'Về VN'), (4, 'Đã xuất')], default=1)),
                ('cn_date', models.DateTimeField(null=True)),
                ('vn_date', models.DateTimeField(null=True)),
                ('exported_date', models.DateTimeField(null=True)),
                ('mass', models.FloatField(default=0)),
                ('mass_convert_factor', models.IntegerField(default=6000)),
                ('length', models.FloatField(default=0)),
                ('width', models.FloatField(default=0)),
                ('height', models.FloatField(default=0)),
                ('mass_unit_price', models.IntegerField(default=0)),
                ('volume_unit_price', models.IntegerField(default=0)),
                ('mass_range_unit_price', models.IntegerField(default=0)),
                ('volume_range_unit_price', models.IntegerField(default=0)),
                ('delivery_fee_type', models.IntegerField(choices=[(1, '1. Max lợi nhuận'), (2, '2. Thang khối lượng'), (3, '3. Đơn giá khối lượng'), (4, '4. Khối lượng quy đổi'), (5, '5. Thang mét khối'), (6, '6. Đơn giá mét khối')], default=1)),
                ('delivery_fee', models.IntegerField(default=0)),
                ('shockproof', models.BooleanField(default=False)),
                ('wooden_box', models.BooleanField(default=False)),
                ('cny_shockproof_fee', models.FloatField(default=0)),
                ('cny_wooden_box_fee', models.FloatField(default=0)),
                ('packages', models.IntegerField(default=1)),
                ('insurance', models.BooleanField(default=False)),
                ('cny_insurance_value', models.FloatField(default=0)),
                ('note', models.CharField(blank=True, max_length=250)),
                ('address', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='address_bols', to='address.Address')),
            ],
            options={
                'db_table': 'bols',
                'ordering': ['-id'],
            },
        ),
    ]
