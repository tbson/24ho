# Generated by Django 2.2.3 on 2019-07-10 03:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bol', '0007_boldate'),
    ]

    operations = [
        migrations.AddField(
            model_name='boldate',
            name='date_str',
            field=models.TextField(default='07/10/2019', editable=False),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='boldate',
            name='date',
            field=models.DateField(editable=False),
        ),
    ]
