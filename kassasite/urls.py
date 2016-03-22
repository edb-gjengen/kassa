from django.conf.urls import include, url
from django.contrib import admin
from apps.kassa import urls as kassa_urls

urlpatterns = [
    url(r'^admin/', include(admin.site.urls)),
    url('^', include(kassa_urls)),
    url('^accounts/', include('django.contrib.auth.urls'))
]
