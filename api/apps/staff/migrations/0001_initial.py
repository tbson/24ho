# Generated by Django 2.2.3 on 2019-07-14 09:21

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0011_update_proxy_permissions'),
    ]

    operations = [
        migrations.CreateModel(
            name='Staff',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('fingerprint', models.CharField(blank=True, max_length=250)),
                ('reset_password_token', models.CharField(blank=True, max_length=250)),
                ('reset_password_tmp', models.CharField(blank=True, max_length=250)),
                ('reset_password_created', models.DateTimeField(blank=True, null=True)),
                ('signup_token', models.CharField(blank=True, max_length=250)),
                ('signup_token_created', models.DateTimeField(blank=True, null=True)),
                ('is_sale', models.BooleanField(default=False)),
                ('is_cust_care', models.BooleanField(default=False)),
                ('is_lock', models.BooleanField(default=False)),
            ],
            options={
                'db_table': 'staffs',
                'ordering': ['-user'],
            },
        ),
    ]
