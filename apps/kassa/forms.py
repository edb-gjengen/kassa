from django import forms
from phonenumber_field.formfields import PhoneNumberField


class AddCardForm(forms.Form):
    phone_number = PhoneNumberField(widget=forms.TextInput(attrs={
        'type': 'tel',
        'class': 'form-control'
    }))
    card_number = forms.IntegerField(widget=forms.NumberInput(attrs={'class': 'form-control'}))
