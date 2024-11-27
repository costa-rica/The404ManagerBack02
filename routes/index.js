var express = require("express");
var router = express.Router();
const os = require("os");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/machine", (req, res) => {
  const machineName = os.hostname();
  res.json({ machineName });
});

module.exports = router;
