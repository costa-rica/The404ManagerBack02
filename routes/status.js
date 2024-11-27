var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");
const { listNginxFiles } = require("../modules/status");

// Route to list files in /etc/nginx/conf.d/
router.get("/list-nginx-files", async (req, res) => {
  const directoryPath = "/etc/nginx/conf.d/";
  const fileList = await listNginxFiles(directoryPath);
  console.log("Files in /etc/nginx/conf.d/");
  console.log(fileList);
  res.json({ files: fileList });
  // // Read the directory
  // fs.readdir(directoryPath, (err, files) => {
  //   if (err) {
  //     console.error("Error reading directory:", err);
  //     return res.status(500).send("Error reading directory");
  //   }

  //   // Filter only files (not directories)
  //   const fileList = files.filter((file) => {
  //     const fullPath = path.join(directoryPath, file);
  //     return fs.statSync(fullPath).isFile();
  //   });

  //   console.log("Files in /etc/nginx/conf.d/");
  //   console.log(fileList);

  //   res.json({ files: fileList });
  // });
});

module.exports = router;
