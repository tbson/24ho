# Generated by Django 2.1.7 on 2019-02-24 08:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Administrator',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fingerprint', models.CharField(blank=True, max_length=250)),
                ('reset_password_token', models.CharField(blank=True, max_length=250)),
                ('reset_password_tmp', models.CharField(blank=True, max_length=250)),
                ('reset_password_created', models.DateTimeField(blank=True, null=True)),
                ('signup_token', models.CharField(blank=True, max_length=250)),
                ('signup_token_created', models.DateTimeField(blank=True, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'administrators',
                'ordering': ['-id'],
            },
        ),
    ]
