# coding: utf-8
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from itertools import groupby
import json
import uuid
import logging
import phonenumbers
import requests

from apps.kassa.models import KassaEvent
from apps.kassa.forms import AddCardForm, SearchUserForm
from apps.kassa.utils import tekstmelding_new_membership_card, update_card, get_card, \
    get_order, get_latest_order_by_card, get_latest_order_by_phone, get_user, get_user_by_phone, \
    dusken_auth, update_membership, format_phone_number, is_autumn

logger = logging.getLogger(__name__)


@login_required
def register(request):
    context = {
        'add_card_form': AddCardForm(),
        'search_user_form': SearchUserForm(),
        'show_trial_membership': is_autumn()
    }
    return render(request, 'kassa/register.html', context)


@login_required
def user_search(request):
    payload = {
        'search': request.GET.get('search', '')
    }
    url = '{}users/'.format(settings.DUSKEN_API_URL)
    data = requests.get(url, params=payload, headers=dusken_auth).json()

    return JsonResponse(data)


@login_required
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
    user = get_user_by_phone(number)
    order = get_latest_order_by_phone(number)

    return JsonResponse({
        'user': user,
        'order': order
    })


@login_required
def check_card(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only method GET supported'})

    card_number = request.GET.get('card_number')
    response = get_card(card_number)
    if response.status_code != 200:
        return JsonResponse(response.json(), status=response.status_code)
    card = response.json()
    if card.get('user'):
        card['user'] = get_user(card['user']).json()
    card['order'] = None
    if card.get('orders'):
        card['order'] = get_latest_order_by_card(card_number)
    card.pop('orders')
    return JsonResponse(card, status=response.status_code)


@login_required
def register_card_and_membership(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only method POST supported'})

    post_data = json.loads(request.body.decode('utf-8'))
    # new_card_membership, update_card, add_or_renew, sms_card_notify
    # TODO: multiple actions (to allow renewal only)
    action = post_data.get('action')
    user_id = post_data.get('user_id')
    order_uuid = post_data.get('order_uuid')
    card_number = post_data.get('card_number')
    phone_number = post_data.get('phone_number')
    membership_trial = post_data.get('membership_trial')
    membership_type = 'trial' if membership_trial else 'standard'

    # Update card number on user or order
    if action in ('update_card', 'sms_card_notify'):
        if action == 'update_card' and user_id:
            response = update_card(card_number, user_id=user_id)
        elif action == 'sms_card_notify' and order_uuid:
            response = update_card(card_number, order_uuid=order_uuid)
        else:
            assert user_id or order_uuid
        if response.status_code != 200:
            return JsonResponse(response.json(), status=response.status_code)

        event_data = {
            'event': KassaEvent.UPDATE_CARD,
            'user_phone_number': phone_number,
            'card_number': card_number,
            'user_dusken_id': user_id,
        }
        logger.debug(event_data)
        KassaEvent.objects.create(**event_data)

    # Add initial or renew membership for existing user or order
    if action in ('add_or_renew', 'new_card_membership'):
        transaction_id = uuid.uuid4()
        response = update_membership(
            user=user_id,
            phone_number=phone_number,
            card_number=card_number,
            membership_type=membership_type,
            transaction_id=str(transaction_id))
        KassaEvent.objects.create(
            event=KassaEvent.ADD_OR_RENEW if membership_type != 'trial' else KassaEvent.MEMBERSHIP_TRIAL,
            user_dusken_id=user_id,
            card_number=card_number,
            user_phone_number=phone_number,
            transaction_id=transaction_id
        )

    # Send activation notification (link) to user by SMS
    if action in ('new_card_membership', 'sms_card_notify'):
        event = KassaEvent.NEW_CARD_MEMBERSHIP
        if action == 'sms_card_notify':
            event = KassaEvent.SMS_CARD_NOTIFY

        # FIXME: could be async
        tekstmelding_new_membership_card(card_number=card_number,
                                         phone_number=phone_number)
        KassaEvent.objects.create(
            event=event,
            card_number=card_number,
            user_phone_number=phone_number
        )

    return JsonResponse(response.json(), status=response.status_code)


@login_required
def renew_membership(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only method POST supported'})

    post_data = json.loads(request.body.decode('utf-8'))
    user_id = post_data.get('user_id')
    phone_number = post_data.get('phone_number')
    card_number = post_data.get('card_number')
    membership_trial = post_data.get('membership_trial')
    membership_type = 'trial' if membership_trial else 'standard'
    transaction_id = str(uuid.uuid4())

    response = update_membership(
        user=user_id,
        phone_number=phone_number,
        card_number=card_number,
        membership_type=membership_type,
        transaction_id=transaction_id)
    KassaEvent.objects.create(
        event=KassaEvent.RENEW_ONLY if membership_trial is None else KassaEvent.MEMBERSHIP_TRIAL,
        user_dusken_id=user_id,
        transaction_id=transaction_id
    )

    return JsonResponse(response.json(), status=response.status_code)


def stats_card_sales(request):
    sale_events = [KassaEvent.ADD_OR_RENEW, KassaEvent.NEW_CARD_MEMBERSHIP, KassaEvent.RENEW_ONLY]
    start = request.GET.get('start')
    if start:
        try:
            start_date = timezone.datetime.strptime(start, '%Y-%m-%d')
        except ValueError:
            logger.info('Invalid start date in param start: \'%s\'', start)
            return JsonResponse({'error': 'Invalid start date in param start: \'{}\''.format(start)})
    else:
        start_date = timezone.datetime(year=2015, month=8, day=1)

    if not timezone.is_aware(start_date):
        start_date = timezone.make_aware(start_date, timezone.get_current_timezone())

    events = KassaEvent.objects.filter(event__in=sale_events, created__gte=start_date).values_list('created')
    grouped = []
    date_format = '%Y-%m-%d'
    for key, values in groupby(events, key=lambda row: row[0].strftime(date_format)):
        grouped.append({'date': key, 'sales': len(list(values))})

    return JsonResponse({'memberships': grouped})
