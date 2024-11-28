# The 404 Manager Backend 02

(newest 2024-11-28)

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
