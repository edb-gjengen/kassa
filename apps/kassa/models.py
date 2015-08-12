from __future__ import unicode_literals
from django.db import models
from django.utils.translation import ugettext_lazy as _


class KassaEvent(models.Model):
    NEW_CARD_MEMBERSHIP = 'new_card_membership'
    SMS_CARD_NOTIFY = 'sms_card_notify'
    UPDATE_CARD = 'update_card'
    ADD_OR_RENEW = 'add_or_renew'
    EVENT_CHOICES = (
        (NEW_CARD_MEMBERSHIP, _('Added new card membership (no user yet)')),
        (SMS_CARD_NOTIFY, _('Notified phone number about activation')),
        (UPDATE_CARD, _('Updated user card number')),
        (ADD_OR_RENEW, _('Added or renewed membership user membership')),
    )
    event = models.CharField(max_length=255, choices=EVENT_CHOICES)
    card_number = models.IntegerField(null=True, blank=True)
    user_inside_id = models.IntegerField(null=True, blank=True)
    user_phone_number = models.CharField(max_length=100, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
