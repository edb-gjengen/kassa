from django.urls import path, re_path

from apps.kassa.views import (register, user_search, check_card, check_phone_number, register_card_and_membership,
                              renew_membership)

urlpatterns = [
    re_path(r'^$', register, name='register'),
    path('user-search/', user_search, name='user-search'),
    path('check-phone-number/', check_phone_number, name='check-phone-number'),
    path('check-card/', check_card, name='check-card'),
    path('register-card-membership/', register_card_and_membership, name='register-card-and-membership'),
    path('renew-membership/', renew_membership, name='renew-membership'),
]
