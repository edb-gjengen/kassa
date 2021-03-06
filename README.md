Kassa helps you register purchased membership cards and memberships. It's a tool for volunteers and bar employees at The Norwegian Student Society.

## TODO
* replace nunjucks with something that is maintained
* autoprefixer
* bootstrap 4.x
* Loading state on submit buttons
* Galtinn/LDAP auth

## Installation
```shell script
apt install libldap2-dev libsasl2-dev # pyldap deps
python3 -m venv venv
. venv/bin/activate
pip install -U pip wheel
pip install -r requirements.txt
python manage.py migrate
```

### Development tasks
```shell script
npm run build:templates  # regenerate nunjucks templates
```
## Configuration
Create a user in Galtinn with the following permissions:
* galtinn | User | Can view User
* galtinn | Member card | Can change Member card
* galtinn | Member card | Can view Member card
* galtinn | Membership | Can add Membership
* galtinn | Membership | Can view Membership
* galtinn | Order | Can view Order

Fetch GALTINN_API_KEY:
```shell script
    curl -H "Content-Type: application/json" -X POST -d '{"username":"apiuser","password":"test"}' GALTINN_API_URL/auth/obtain-token/
```

If developing you can disable calls to Tekstmelding in local_settings.py:
```python
TEKSTMELDING_ENABLED = False
```

## LDAP
```shell script
sudo docker run -e LDAP_DOMAIN=neuf.no -e LDAP_ORGANISATION="Neuf" -e LDAP_ADMIN_PASSWORD="toor" -p 389:389 -d nikolaik/openldap
ldapadd -D "cn=admin,dc=neuf,dc=no" -w "toor" -f test/testdata.ldif  # Testdata
# Verify import
ldapsearch -x -b dc=neuf,dc=no
# Login with test@example.com:test
```
