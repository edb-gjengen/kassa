# coding: utf-8
from __future__ import unicode_literals

from django.conf import settings
import json
import requests


def tekstmelding_new_membership_card(card_number, phone_number):
    payload = {
        'phone_number': phone_number,
        'card_number': card_number,
        'action': 'new_card_no_user',
    }

    url = '{}kassa/new-membership-card'.format(settings.TEKSTMELDING_API_URL)
    response = requests.post(
        url,
        data=json.dumps(payload),
        params={'api_key': settings.TEKSTMELDING_API_KEY},
        headers={'Content-Type': 'application/json'}
    )

    return response.json()


def inside_get_card(card_number):
    url = '{}card.php'.format(settings.INSIDE_API_URL)
    params = {
        'apikey': settings.INSIDE_API_KEY,
        'card_number': card_number
    }

    return requests.get(url, params=params)


def inside_update_card(card_number, user_id, phone_number, action):
    url = '{}card.php'.format(settings.INSIDE_API_URL)
    params = {'apikey': settings.INSIDE_API_KEY}

    payload = {
        'card_number': card_number,
        'user_id': user_id,
        'phone_number': phone_number,
        'action': action  # new_card_membership, update_card, add_or_renew
    }
    return requests.post(
        url,
        data=json.dumps(payload),
        params=params,
        headers=dict(content_type='application/json')
    )


def inside_update_membership(user_id, purchased=None):
    url = '{}membership.php'.format(settings.INSIDE_API_URL)
    payload = {
        'apikey': settings.INSIDE_API_KEY,
        'user_id': user_id,
        'purchased': purchased,
        'source': 'card'
    }
    return requests.post(url, data=json.dumps(payload), headers=dict(content_type='application/json'))
