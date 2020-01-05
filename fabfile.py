import os

from fabric import Connection
from invoke import task


@task()
def deploy(c):
    """Make sure proxy_user is set to your neuf username."""
    project_path = '/var/www/neuf.no/kassa'
    proxy_user = os.getenv('DEPLOY_USER', os.getenv('USER'))

    c = Connection(host='gitdeploy@dreamcast.neuf.no', gateway=Connection('login.neuf.no', user=proxy_user))

    with c.cd(project_path), c.prefix('source {}/venv/bin/activate'.format(project_path)):
        c.run('git pull')  # Get source
        c.run('pip install -U pip')
        c.run('pip install -r requirements.txt')  # install deps in virtualenv
        with c.cd('static'):  # install and compile frontend deps
            c.run('npm i')
            c.run('npm run build')
        c.run('python manage.py collectstatic --noinput -i node_modules')  # Collect static
        c.run('python manage.py migrate')  # Run DB migrations

    # Reload gunicorn
    c.sudo('/usr/bin/supervisorctl pid kassa.neuf.no | xargs kill -HUP', shell=False)


@task
def build(c):
    with c.cd('static'):
        c.run('npm i')
        c.run('npm run build')
