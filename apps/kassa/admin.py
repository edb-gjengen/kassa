from apps.kassa.models import KassaEvent
from django.contrib import admin


class KassaEventAdmin(admin.ModelAdmin):
    list_display = ['id', 'event', 'card_number', 'user_phone_number', 'user_inside_id', 'created']
    list_filter = ['event']

admin.site.register(KassaEvent, KassaEventAdmin)
