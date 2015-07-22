## TODO
* lookup sms-tables in inside
* register membership in inside-table din_phonenumber, din_usedmembercard, din_user
* Inside auth

### Form
* tlf field
    * validates in javascript with phonenumber-package
    * onkeyup could shows matching user data from inside (name, expires)
* submit button
    * change text to "... and renew" if existing member
    * grey if form invalid
    * blue if form valid
    * grey out on submit

## Installation
    apt install libldap2-dev # reqs
    virtualenv venv
    . venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate

### LDAP
    sudo docker run -e LDAP_DOMAIN=neuf.no -e LDAP_ORGANISATION="Neuf" -e LDAP_ADMIN_PASSWORD="toor" -p 389:389 -d nikolaik/openldap
    ldapadd -D "cn=admin,dc=neuf,dc=no" -w "toor" -f test/testdata.ldif  # Testdata
    # Verify import
    ldapsearch -x -b dc=neuf,dc=no
    # Login with test@example.com:test