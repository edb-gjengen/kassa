from django.conf.urls import url
from apps.kassa.views import (register, user_search, check_card,
                              check_phone_number, register_card_and_membership,
                              stats_card_sales, renew_membership)

urlpatterns = [
    url(r'^$', register, name='register'),
    url(r'^user-search/$', user_search, name='user-search'),
    url(r'^check-phone-number/$', check_phone_number, name='check-phone-number'),
    url(r'^check-card/$', check_card, name='check-card'),
    url(r'^register-card-membership/$', register_card_and_membership, name='register-card-and-membership'),
    url(r'^renew-membership/$', renew_membership, name='renew-membership'),
    url(r'^stats/card-sales/$', stats_card_sales, name='stats-card-sales')
]
