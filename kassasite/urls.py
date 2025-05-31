from django.contrib import admin
from django.contrib.auth import urls as auth_urls
from django.urls import include, path

from apps.kassa import urls as kassa_urls

urlpatterns = [path("admin/", admin.site.urls), path("", include(kassa_urls)), path("accounts/", include(auth_urls))]
