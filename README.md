Kassa helps you register purchased membership cards and memberships. It's a tool for volunteers and bar employees at The Norwegian Student Society.

## TODO
* Loading state on submit buttons
* Inside auth

## Installation
    apt install libldap2-dev libsasl2-dev # pyldap deps
    python3 -m venv venv
    . venv/bin/activate
    pip install -U pip wheel
    pip install -r requirements.txt
    python manage.py migrate

### LDAP
    sudo docker run -e LDAP_DOMAIN=neuf.no -e LDAP_ORGANISATION="Neuf" -e LDAP_ADMIN_PASSWORD="toor" -p 389:389 -d nikolaik/openldap
    ldapadd -D "cn=admin,dc=neuf,dc=no" -w "toor" -f test/testdata.ldif  # Testdata
    # Verify import
    ldapsearch -x -b dc=neuf,dc=no
    # Login with test@example.com:test