import os

from fabric import Connection
from invoke import task


@task()
def deploy(c):
    """Make sure proxy_user is set to your neuf username."""
    project_path = "/var/www/neuf.no/kassa"
    proxy_user = os.getenv("DEPLOY_USER", os.getenv("USER"))

    c = Connection(host="gitdeploy@dreamcast.neuf.no", gateway=Connection("login.neuf.no", user=proxy_user))

    with c.cd(project_path), c.prefix(f"source {project_path}/venv/bin/activate"):
        c.run("git pull")  # Get source
        c.run("uv sync")  # install deps in virtualenv
        with c.cd("static"):  # install and compile frontend deps
            c.run("npm i")
            c.run("npm run build")
        c.run("uv run manage.py collectstatic --noinput -i node_modules")  # Collect static
        c.run("uv run manage.py migrate")  # Run DB migrations

    # Reload gunicorn
    c.sudo("/usr/bin/supervisorctl pid kassa.neuf.no | xargs kill -HUP", shell=False)


@task
def build(c):
    with c.cd("static"):
        c.run("npm i")
        c.run("npm run build")
