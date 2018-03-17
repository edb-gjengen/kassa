from contextlib import contextmanager as _contextmanager
from fabric.api import run, sudo, env, cd, prefix

env.use_ssh_config = True
env.hosts = ['dreamcast.neuf.no']
env.project_path = '/var/www/neuf.no/kassa'
env.user = 'gitdeploy'
env.activate = 'source {}/venv/bin/activate'.format(env.project_path)


@_contextmanager
def virtualenv():
    with cd(env.project_path), prefix(env.activate):
        yield


def deploy():
    with virtualenv():
        run('git pull')  # Get source
        run('pip install -r requirements.txt')  # install deps in virtualenv
        run('umask 022; python manage.py collectstatic --noinput')  # Collect static
        run('python manage.py migrate')  # Run DB migrations

    # Reload
    sudo('/usr/bin/supervisorctl pid kassa.neuf.no | xargs kill -HUP', shell=False)
