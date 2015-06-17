from django.conf.urls import url
from apps.kassa.views import register

urlpatterns = [
    url(r'^$', register)
]