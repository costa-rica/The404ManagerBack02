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

// Route to list files in /etc/nginx/conf.d/ and list of pm2 ecosystem files that are active (i.e pm2 has started at least once and not deleted)
// router.get("/list-nginx-files", async (req, res) => {
router.get("/list-apps", async (req, res) => {
  const nginxFilesList = await createNginxFilesList(
    process.env.NGINX_CONF_D_PATH
  );

  pm2AppList = await createPm2AppList();

  const appList = mergePm2AndNginxLists(pm2AppList, nginxFilesList);
  if (process.env.NODE_ENV === "production") {
    appList.map(async (elem) => {
      const { localIp, port, ...rest } = elem;
      const updatedProps = {
        ...rest, // Spread the existing properties
        lastUpdatedDate: new Date(), // Add the new property
      };
      await App.updateOne(
        { localIp, port }, // search properties
        { $set: updatedProps }, // Update fields
        { upsert: true } // Create a new document if no match is found
      );
    });
  }
  res.json({ appList });
});

module.exports = router;
