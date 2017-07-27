from django import forms
from phonenumber_field.formfields import PhoneNumberField
from django.utils.translation import ugettext_lazy as _


class SearchUserForm(forms.Form):
    query = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': _('Firstname, lastname, card number or email')})
    )


class AddCardForm(forms.Form):
    card_number = forms.IntegerField(widget=forms.NumberInput(attrs={'autofocus': True}))
    phone_number = PhoneNumberField(widget=forms.TextInput(attrs={'type': 'tel'}))
    user_id = forms.IntegerField(widget=forms.HiddenInput(), required=False)
    order_uuid = forms.IntegerField(widget=forms.HiddenInput(), required=False)
