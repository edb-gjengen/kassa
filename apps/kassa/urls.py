from django.conf.urls import url
from apps.kassa.views import register, inside_user_api, inside_card_api, inside_register_api, \
    check_phone_number

urlpatterns = [
    url(r'^$', register, name='register'),
    url(r'^inside/user/$', inside_user_api, name='inside-user-api'),
    url(r'^check-phonenumber/$', check_phone_number, name='check-phone-number'),
    url(r'^inside/card/$', inside_card_api, name='inside-card-number-api'),
    url(r'^inside/register/$', inside_register_api, name='inside-register-api'),
]
