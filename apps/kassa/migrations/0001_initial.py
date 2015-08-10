# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='KassaEvent',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('event', models.TextField(max_length=255, choices=[('new_card_membership', 'Added new card membership (no user yet)'), ('update_card', 'Updated user card number'), ('add_or_renew', 'Added or renewed membership user membership')])),
                ('card_number', models.IntegerField(null=True, blank=True)),
                ('user_inside_id', models.IntegerField(null=True, blank=True)),
                ('user_phone_number', models.TextField(max_length=100, null=True, blank=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
