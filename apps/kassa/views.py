# coding: utf-8
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from apps.kassa.forms import AddCardForm


@login_required
def register(request):
    context = {
        'form': AddCardForm()
    }
    return render(request, 'kassa/register.html', context)
