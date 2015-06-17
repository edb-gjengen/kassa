# coding: utf-8
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

@login_required
def register(request):
    context = {}
    return render(request, 'kassa/register.html', context)


def home(request):
    context = {}
    return render(request, 'kassa/register.html', context)
