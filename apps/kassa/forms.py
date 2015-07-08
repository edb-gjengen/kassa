from django import forms
from phonenumber_field.formfields import PhoneNumberField
from django.utils.translation import ugettext_lazy as _


class SearchUserForm(forms.Form):
    query = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': _('Search')})
    )


class AddCardForm(forms.Form):
    phone_number = PhoneNumberField(widget=forms.TextInput(attrs={'type': 'tel'}))
    card_number = forms.IntegerField(widget=forms.NumberInput())
