var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");
const {
  createNginxFilesList,
  createPm2AppList,
  getLocalIpAddress,
  mergePm2AndNginxLists,
} = require("../modules/status");
const App = require("../models/app");
// const User = require("../models/user");

// Route to list files in /etc/nginx/conf.d/
router.get("/list-nginx-files", async (req, res) => {
  const nginxFilesList = await createNginxFilesList(
    process.env.NGINX_CONF_D_PATH
  );
  console.log(`file nginx: ${process.env.NGINX_CONF_D_PATH}`);
  // console.log(nginxFilesList);

  // GET
  // -> name of app [pm2]
  // -> urls [check]
  // -> local IP
  // -> port number [check]
  pm2AppList = createPm2AppList();

  const appList = mergePm2AndNginxLists(pm2AppList.appsList, nginxFilesList);
  if (process.env.NODE_ENV === "production") {
    appList.map((elem) => {
      App.find({ localIp: elem.localIpAddress, port: elem.portNumber }).then(
        (app) => {
          App.updateOne(
            { localIp: elem.localIpAddress, port: elem.portNumber },
            {
              name: elem.name,
              urls: elem.serverNames,
              lastUpdatedDate: new Date(),
            }
          );
        }
      );
      const newApp = new App({
        localIp: elem.localIpAddress,
        port: elem.portNumber,
        name: elem.name,
        urls: elem.serverNames,
        lastUpdatedDate: new Date(),
      });
      newApp.save();
    });
  }
  res.json({ appList });
});

module.exports = router;
