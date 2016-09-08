# coding: utf-8
from django.conf import settings
import datetime
import phonenumbers
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
        json=payload,
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


def inside_update_card(card_number, user_id, phone_number, action, membership_trial=None):
    url = '{}card.php'.format(settings.INSIDE_API_URL)

    payload = {
        'card_number': card_number,
        'user_id': user_id,
        'phone_number': phone_number,
        'action': action  # new_card_membership, update_card, add_or_renew, sms_card_notify
    }
    if membership_trial is not None:
        payload.update({'membership_trial': membership_trial})

    return requests.post(
        url,
        json=payload,
        params={'apikey': settings.INSIDE_API_KEY},
        headers=dict(content_type='application/json')
    )


def inside_update_membership(user_id, purchased=None, membership_trial=None):
    url = '{}membership.php'.format(settings.INSIDE_API_URL)
    payload = {
        'apikey': settings.INSIDE_API_KEY,
        'user_id': user_id,
        'purchased': purchased,
        'source': 'kassa'
    }
    if membership_trial is not None:
        payload.update({'membership_trial': membership_trial})

    return requests.post(url, json=payload, headers=dict(content_type='application/json'))


def format_phone_number(number):
    if len(number) == 0:
        return number

    try:
        p = phonenumbers.parse(number, region='NO')
    except phonenumbers.NumberParseException:
        return number

    if not phonenumbers.is_valid_number(p):
        return number

    return phonenumbers.format_number(p, phonenumbers.PhoneNumberFormat.E164)


def is_autumn():
    today = datetime.date.today()
    _min = datetime.date(year=today.year, month=8, day=1)
    _max = datetime.date(year=today.year + 1, month=1, day=1)
    return _min <= today < _max
