# The 404 Manager Backend 02

(newest 2024-11-28)

## .env

```env
APP_NAME="The404MangerBack02"
PROJECT_RESOURCES=/home/dashanddata_user/project_resources/The404MangerBack02
DB_CONNECTION_STRING=mongodb+srv://<user>:<key>@cluster0.8puct.mongodb.net/The404ManagerBack02
SECRET_KEY=sudo_let_me_in
ADMIN_EMAIL=
ADMIN_PASSWORD=
PORT=
NODE_ENV=production
FILE_PATH_SYSLOG=/var/log/syslog
FILE_PATH_PM2_OUTPUT=/home/dashanddata_user/.pm2/logs/combined.log
FILE_PATH_PM2_ERROR=/home/dashanddata_user/.pm2/logs/combined-error.log
NGINX_CONF_D_PATH=/etc/nginx/conf.d
```

- NODE_ENV and PORT should be in the ecosystem.config.js file

## Routes

GET /status/list-nginx-files

- response from DevelopmentServer (port 8005):

```json
{
  "files": [
    {
      "fileName": "dev-server-captain.dashanddata.com.conf",
      "serverNames": ["dev-server-captain.dashanddata.com"],
      "portNumber": "8004"
    },
    {
      "fileName": "www.developmentwebapp.dashanddata.com.conf",
      "serverNames": ["www.developmentwebapp.dashanddata.com"],
      "portNumber": "8000"
    }
  ]
}
```
