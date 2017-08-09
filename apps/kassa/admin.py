from apps.kassa.models import KassaEvent
from django.contrib import admin


class KassaEventAdmin(admin.ModelAdmin):
    list_display = ['id', 'event', 'card_number', 'user_phone_number', 'user_galtinn_id',
                    'user_inside_id', 'created', 'transaction_id']
    list_filter = ['event']
    search_fields = ['card_number', 'user_phone_number', 'user_galtinn_id',
                     'user_inside_id', 'transaction_id']

admin.site.register(KassaEvent, KassaEventAdmin)
