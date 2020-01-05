from django.conf.urls import include, url
from django.contrib import admin
from django.urls import path

from django.contrib.auth import urls as auth_urls

from apps.kassa import urls as kassa_urls

urlpatterns = [
    path('admin/', admin.site.urls),
    url('^', include(kassa_urls)),
    path('accounts/', include(auth_urls))
]
