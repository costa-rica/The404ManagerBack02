var express = require("express");
var router = express.Router();
const os = require("os");
const { checkBody } = require("../modules/checkbody");
const { createToken, findUserByEmail } = require("../modules/token");
const User = require("../models/user");
const bcrypt = require("bcrypt");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", async (req, res) => {
  console.log("in POST /register");
  if (!checkBody(req.body, ["email", "password"])) {
    return res
      .status(401)
      .json({ result: false, error: "Missing or empty fields" });
  }
  const acceptedEmails = JSON.parse(process.env.ACCEPTED_EMAILS || "[]");

  const isAcceptedEmail = acceptedEmails.includes(req.body.email);

  if (process.env.NODE_ENV == "production") {
    if (!isAcceptedEmail) {
      console.log(" 🚨 Did not register user");
      return res.status(401).json({ message: "This email is not accepted" });
    } else {
      console.log("--> mail is accepted");
    }
  } else {
    console.log("--> process.env.NODE_ENV is NOT equal to production");
  }

  const email = req.body.email;
  const passwordHashed = bcrypt.hashSync(req.body.password, 10);
  const existing_user = await findUserByEmail(email);
  if (existing_user) {
    return res
      .status(400)
      .json({ result: false, message: "User exists already" });
  }
  // Create the user
  const user = new User({
    email,
    password: passwordHashed,
  });

  // Save the user to the database
  await user.save();
  const token = createToken({ user_id: 1 });
  return res.json({ result: true, token });
});

router.post("/login", async (req, res) => {
  console.log("in POST /login");
  if (!checkBody(req.body, ["email", "password"])) {
    return res
      .status(401)
      .json({ result: false, error: "Missing or empty fields" });
  }
  console.log("body.email", req.body.email);
  console.log("body.password", req.body.password);
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await findUserByEmail(email);
    console.log("user.email: ", user.email);
    console.log("user.password: ", user.password);

    console.log(`user.id: ${user.id}`);
    // check password
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      console.log("wrong password");
      return res
        .status(401)
        .json({ result: false, message: "Mot de passe erroné" });
    }

    const token = createToken({ user_id: user.id });

    console.log("token: ", token);
    return res.json({ result: true, message: "found user", token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
