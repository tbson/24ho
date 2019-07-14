# Generated by Django 2.2.3 on 2019-07-14 09:21

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CountCheck',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('from_items', models.IntegerField()),
                ('to_items', models.IntegerField()),
                ('fee', models.FloatField()),
            ],
            options={
                'db_table': 'count_checks',
                'ordering': ['-to_items'],
            },
        ),
    ]
