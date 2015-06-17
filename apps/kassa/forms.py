from django.forms import forms
from phonenumber_field.formfields import PhoneNumberField


class AddCardForm(forms.Form):
    tlf = PhoneNumberField()  # Type
