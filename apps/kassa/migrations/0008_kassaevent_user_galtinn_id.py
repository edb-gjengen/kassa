# -*- coding: utf-8 -*-
# Generated by Django 1.11.3 on 2017-07-22 12:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('kassa', '0007_kassaevent_transaction_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='kassaevent',
            name='user_galtinn_id',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]