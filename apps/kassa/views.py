# coding: utf-8
from __future__ import unicode_literals
import json

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
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


@login_required
def inside_phone_number_api(request):
    payload = {
        'apikey': settings.INSIDE_API_KEY,
        'q': request.GET.get('q', '')
    }
    url = '{}phonenumber.php'.format(settings.INSIDE_API_URL)
    data = requests.get(url, params=payload).json()

    return JsonResponse(data)


@login_required
def inside_card_number_api(request):
    url = '{}cardnumber.php'.format(settings.INSIDE_API_URL)
    params = {
        'apikey': settings.INSIDE_API_KEY
    }

    if request.method == 'POST':
        post_data = json.loads(request.body)
        payload = {
            'card_number': post_data.get('card_number'),
            'user_id': post_data.get('user_id')
        }
        print payload
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
        'cardno': post_data.get('cardno'),
        'source': 'physical'
    }
    url = '{}register.php'.format(settings.INSIDE_API_URL)
    response = requests.post(url, data=json.dumps(payload), headers=dict(content_type='application/json'))

    return JsonResponse(response.json(), status=response.status_code)
