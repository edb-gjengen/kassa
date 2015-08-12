# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('kassa', '0002_auto_20150810_1327'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kassaevent',
            name='event',
            field=models.CharField(max_length=255, choices=[('new_card_membership', 'Added new card membership (no user yet)'), ('sms_card_notify', 'Notified phone number about activation'), ('update_card', 'Updated user card number'), ('add_or_renew', 'Added or renewed membership user membership')]),
        ),
    ]
