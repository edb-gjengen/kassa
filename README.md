# Installation
    apt install libldap2-dev # reqs
    virtualenv venv
    . venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate


## LDAP
    sudo docker run -e LDAP_DOMAIN=neuf.no -e LDAP_ORGANISATION="Neuf" -e LDAP_ADMIN_PASSWORD="toor" -p 389:389 -d nikolaik/openldap
    ldapadd -D "cn=admin,dc=neuf,dc=no" -w "toor" -f test/testdata.ldif  # Testdata
    # Verify import
    ldapsearch -x -b dc=neuf,dc=no
    # Login with test@example.com:test

## TODO
### Form
* tlf field
    * validates in javascript with phonenumber-package
    * onkeyup could shows matching user data from inside (name, expires)
* cardnumber field
    * js validation
    * js lookup from membercardnumber table
* submit button
    * grey if form invalid
    * blue if form valid
    * grey out on submit
* verify consistency

### Other
* Inside auth and models
* local users tied to inside user
* maybe user add page
* menu with login and logout

### Backend
* store in inside-table din_phonenumber, din_usedmembercard, din_user
* lookup inside user table
* lookup sms-tables in inside