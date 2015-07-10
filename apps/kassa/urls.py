from django.conf.urls import url
from apps.kassa.views import register, inside_user_api, inside_phone_number_api, inside_card_number_api

urlpatterns = [
    url(r'^$', register, name='register'),
    url(r'^inside/user/$', inside_user_api, name='inside-user-api'),
    url(r'^inside/phonenumber/$', inside_phone_number_api, name='inside-phone-number-api'),
    url(r'^inside/cardnumber/$', inside_card_number_api, name='inside-card-number-api')
]
