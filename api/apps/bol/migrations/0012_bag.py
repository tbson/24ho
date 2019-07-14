# Generated by Django 2.2.3 on 2019-07-10 06:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0011_auto_20190710_1250'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=128, unique=True)),
            ],
            options={
                'db_table': 'bags',
                'ordering': ['-id'],
            },
        ),
    ]
