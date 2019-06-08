# Generated by Django 2.2.1 on 2019-05-21 13:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('category', '0004_auto_20190513_2045'),
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=100)),
                ('content', models.TextField()),
                ('uid', models.CharField(max_length=50, unique=True)),
                ('category', models.ForeignKey(limit_choices_to={'type': 'article'}, on_delete=django.db.models.deletion.CASCADE, related_name='category', to='category.Category')),
            ],
            options={
                'db_table': 'articles',
                'ordering': ['-id'],
            },
        ),
    ]