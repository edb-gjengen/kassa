# coding: utf-8
from __future__ import unicode_literals
import json

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
import phonenumbers
import requests

from apps.kassa.forms import AddCardForm, SearchUserForm


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
        p = phonenumbers.parse(number, 'NO')
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
    url = '{}kassa-pending-membership'.format(settings.TEKSTMELDING_API_URL)
    tekstmelding_data = requests.get(url, params=payload).json()

    return JsonResponse({
        'tekstmelding': tekstmelding_data,
        'inside': inside_data
    })


@login_required
def inside_card_api(request):
    url = '{}card.php'.format(settings.INSIDE_API_URL)
    params = {
        'apikey': settings.INSIDE_API_KEY
    }

    if request.method == 'POST':
        post_data = json.loads(request.body)
        payload = {
            'card_number': post_data.get('card_number'),
            'user_id': post_data.get('user_id'),
            'phone_number': post_data.get('phone_number'),
            'type': post_data.get('type')  # renewal, new_user, new_card_only,
        }
        response = requests.post(
            url,
            data=json.dumps(payload),
            params=params,
            headers=dict(content_type='application/json')
        )
    else:
        params.update({
            'card_number': request.GET.get('card_number', '')
        })
        response = requests.get(url, params=params)

    return JsonResponse(response.json(), status=response.status_code)


@login_required
def inside_register_api(request):
    post_data = json.loads(request.body)
    payload = {
        'apikey': settings.INSIDE_API_KEY,
        'phone': post_data.get('phone_number'),
        # 'user_id': post_data.get('user_id'),
        'type': post_data.get('type'),  # 'renewal' or 'new'
        'card_number': post_data.get('card_number'),
        'source': 'physical'
    }
    url = '{}register.php'.format(settings.INSIDE_API_URL)
    response = requests.post(url, data=json.dumps(payload), headers=dict(content_type='application/json'))

    return JsonResponse(response.json(), status=response.status_code)
