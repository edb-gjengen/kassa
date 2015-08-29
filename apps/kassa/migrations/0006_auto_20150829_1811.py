# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('kassa', '0005_auto_20150829_1525'),
    ]

    operations = [
        migrations.AlterField(
            model_name='kassaevent',
            name='event',
            field=models.CharField(max_length=255, choices=[('add_or_renew', 'New or renewed user membership'), ('new_card_membership', 'New card membership (no user yet)'), ('refund', 'Refunded membership'), ('renew_only', 'Renewed user membership'), ('sms_card_notify', 'Sent activation link to phone number'), ('update_card', 'Updated card'), ('membership_trial', 'New membership trial')]),
        ),
    ]
