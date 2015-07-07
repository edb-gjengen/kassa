from django.conf.urls import url
from apps.kassa.views import register, inside_user_api

urlpatterns = [
    url(r'^$', register, name='register'),
    url(r'^inside/user/$', inside_user_api, name='inside-user-api')
]
