# coding: utf-8
from __future__ import unicode_literals

from django.conf import settings
import json
import requests


def tekstmelding_new_card_no_user(card_number, phone_number):
    payload = {
        'phone_number': phone_number,
        'card_number': card_number,
        'action': 'new_card_no_user',
    }

    url = '{}kassa/notify-new-card'.format(settings.TEKSTMELDING_API_URL)
    response = requests.post(
        url,
        data=json.dumps(payload),
        params={'api_key': settings.TEKSTMELDING_API_KEY},
        headers={'Content-Type': 'application/json'}
    )

    return response.json()
