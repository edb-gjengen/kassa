# coding: utf-8
from django.conf import settings
import datetime
import phonenumbers
import requests
import logging

logger = logging.getLogger(__name__)

dusken_auth = {
    'Authorization': 'Token {}'.format(settings.DUSKEN_API_KEY)
}


def tekstmelding_new_membership_card(card_number, phone_number):
    payload = {
        'phone_number': phone_number,
        'card_number': card_number,
        'action': 'new_card_no_user',
    }

    if not settings.TEKSTMELDING_ENABLED:
        logger.info('Tekstmelding disabled. Payload would be: ', payload)
        return

    url = '{}kassa/new-membership-card'.format(settings.TEKSTMELDING_API_URL)
    response = requests.post(
        url,
        json=payload,
        params={'api_key': settings.TEKSTMELDING_API_KEY},
        headers={'Content-Type': 'application/json'}
    )

    return response.json()


def get_card(card_number):
    url = '{}cards/{}/'.format(settings.DUSKEN_API_URL, card_number)
    return requests.get(url, headers=dusken_auth)


def get_order(order_uuid):
    url = '{}orders/{}/'.format(settings.DUSKEN_API_URL, order_uuid)
    return requests.get(url, headers=dusken_auth)


def get_latest_order_by_card(card_number):
    url = '{}orders/'.format(settings.DUSKEN_API_URL)
    payload = {'card_number': card_number}
    orders = requests.get(url, params=payload, headers=dusken_auth).json()
    return orders.get('results')[0]


def get_latest_order_by_phone(phone_number):
    url = '{}orders/'.format(settings.DUSKEN_API_URL)
    payload = {'phone_number': phone_number}
    orders = requests.get(url, params=payload, headers=dusken_auth).json()
    if orders.get('count'):
        return orders.get('results')[0]
    return None


def get_user(user_id):
    url = '{}users/{}/'.format(settings.DUSKEN_API_URL, user_id)
    return requests.get(url, headers=dusken_auth)


def get_user_by_phone(phone_number):
    url = '{}users/'.format(settings.DUSKEN_API_URL)
    payload = {'phone_number': phone_number}
    users = requests.get(url, params=payload, headers=dusken_auth).json()
    if users.get('count') == 1:
        return users.get('results')[0]
    return None


def update_card(card_number, user_id=None, order_uuid=None):
    assert not (user_id and order_uuid)
    url = '{}kassa/card/'.format(settings.DUSKEN_API_URL)
    payload = {
        'member_card': card_number,
        'user': user_id,
        'order': order_uuid,
    }
    return requests.patch(url, json=payload, headers=dusken_auth)


def update_membership(user=None, phone_number=None, card_number=None, membership_type=None,
                      transaction_id=None):
    assert membership_type in ('standard', 'trial')
    url = '{}kassa/membership/'.format(settings.DUSKEN_API_URL)
    payload = {
        'user': user,
        'phone_number': phone_number,
        'member_card': card_number,
        'membership_type': membership_type,
        'transaction_id': transaction_id,
    }
    return requests.post(url, json=payload, headers=dusken_auth)


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
