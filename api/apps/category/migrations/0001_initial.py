# Generated by Django 2.2 on 2019-05-12 04:35

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uid', models.CharField(max_length=60, unique=True)),
                ('title', models.CharField(max_length=250)),
                ('cType', models.CharField(max_length=60)),
                ('single', models.BooleanField(default=False)),
                ('order', models.IntegerField(default=0)),
            ],
            options={
                'db_table': 'categories',
                'ordering': ['-id'],
            },
        ),
    ]