# coding: utf-8
from __future__ import unicode_literals
from itertools import groupby
import json
from django.utils import timezone
from apps.kassa.models import KassaEvent

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
import phonenumbers
import requests
import logging

from apps.kassa.forms import AddCardForm, SearchUserForm
from apps.kassa.utils import tekstmelding_new_membership_card, inside_update_card, inside_get_card, \
    inside_update_membership, format_phone_number

logger = logging.getLogger(__name__)


@login_required
def register(request):
    context = {
        'add_card_form': AddCardForm(),
        'search_user_form': SearchUserForm()
    }
    return render(request, 'kassa/register.html', context)


@login_required
def inside_user_api(request):
    payload = {
        'apikey': settings.INSIDE_API_KEY,
        'q': request.GET.get('q', '')
    }
    url = '{}user.php'.format(settings.INSIDE_API_URL)
    data = requests.get(url, params=payload).json()

    return JsonResponse(data)


@login_required()
def check_phone_number(request):
    number = request.GET.get('phone_number', '').strip()

    if len(number) < 2:
        return JsonResponse({'error': 'Phone number is too short'})

    # Is phone number valid?
    try:
        p = phonenumbers.parse(number, region='NO')
        if not phonenumbers.is_valid_number(p):
            return JsonResponse({'error': "Phone number '{}' is invalid.".format(number)})
    except phonenumbers.NumberParseException as e:
        return JsonResponse({'error': str(e).replace('(1) ', '')})

    number = phonenumbers.format_number(p, phonenumbers.PhoneNumberFormat.E164)

    # Inside lookup existing user
    payload = {
        'apikey': settings.INSIDE_API_KEY,
        'q': number
    }
    url = '{}phonenumber.php'.format(settings.INSIDE_API_URL)
    inside_data = requests.get(url, params=payload).json()

    # Tekstmelding lookup pending memberships
    payload = {
        'api_key': settings.TEKSTMELDING_API_KEY,
        'number': number
    }
    url = '{}kassa/pending-membership'.format(settings.TEKSTMELDING_API_URL)
    tekstmelding_data = requests.get(url, params=payload).json()

    return JsonResponse({
        'tekstmelding': tekstmelding_data,
        'inside': inside_data
    })


@login_required
def inside_card_api(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only method GET supported'})

    response = inside_get_card(request.GET.get('card_number'))
    return JsonResponse(response.json(), status=response.status_code)


@login_required()
def register_card_and_membership(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only method POST supported'})

    post_data = json.loads(request.body)
    action = post_data.get('action')  # new_card_membership, update_card, add_or_renew, sms_card_notify
    # TODO: multiple actions (to allow renewal only)
    user_id = post_data.get('user_id')
    card_number = post_data.get('card_number')

    response = inside_update_card(
        card_number,
        user_id,
        post_data.get('phone_number'),
        action
    )
    if response.status_code != 200:
        return JsonResponse(response.json(), status=response.status_code)

    event_data = {
        'event': KassaEvent.UPDATE_CARD,
        'user_phone_number': format_phone_number(post_data.get('phone_number')),
        'card_number': card_number
    }
    if user_id:
        event_data.update({'user_inside_id': user_id})

    logger.debug(event_data)

    KassaEvent.objects.create(**event_data)

    card_update_response = response.json()

    # Send activation notification (link) to user by SMS
    if action == 'new_card_membership' or action == 'sms_card_notify':
        card = card_update_response['card']
        event = KassaEvent.NEW_CARD_MEMBERSHIP
        if action == 'sms_card_notify':
            event = KassaEvent.SMS_CARD_NOTIFY

        # FIXME: could be async
        tekstmelding_new_membership_card(card_number=card['card_number'], phone_number=card['owner_phone_number'])
        KassaEvent.objects.create(
            event=event,
            card_number=card['card_number'],
            user_phone_number=card['owner_phone_number']
        )

    # Add initial or renew membership for existing user
    elif action == 'add_or_renew':
        response = inside_update_membership(user_id, post_data.get('purchased'))
        KassaEvent.objects.create(
            event=KassaEvent.ADD_OR_RENEW,
            user_inside_id=user_id
        )

    return JsonResponse(response.json(), status=response.status_code)


def stats_card_sales(request):
    sale_events = [KassaEvent.ADD_OR_RENEW, KassaEvent.NEW_CARD_MEMBERSHIP]

    # TODO filter by start HTTP param
    start_date = timezone.datetime(year=2015, month=8, day=1)
    start_date = timezone.make_aware(start_date, timezone.get_current_timezone())

    events = KassaEvent.objects.filter(event__in=sale_events, created__gte=start_date).values_list('created')
    grouped = []
    date_format = '%Y-%m-%d'
    for key, values in groupby(events, key=lambda row: row[0].strftime(date_format)):
        grouped.append({'date': key, 'sales': len(list(values))})

    return JsonResponse({'memberships': grouped})
