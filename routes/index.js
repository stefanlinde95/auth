const router = require("express").Router();
const passport = require("passport");
const genPassword = require("../lib/passwordUtils").genPassword;
const connection = require("../config/database");
const { isAuth } = require("./authMiddleware");
const User = connection.models.User;
var postmark = require("postmark");

var client = new postmark.ServerClient("595c4199-977e-415f-b06e-54df5a291cef");

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/login-success",
  }),
);

router.post("/register", (req, res, next) => {
  const saltHash = genPassword(req.body.pw);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
    username: req.body.uname,
    hash: hash,
    salt: salt,
  });

  User.findOne({ username: req.body.uname }, function (err, user) {
    if (err) {
      return document(err);
    }
    if (!user) {
      newUser.save();
      client.sendEmail({
        From: "info@devstep.ee",
        To: "info@devstep.ee",
        Subject: "New user",
        TextBody: "Hello from Postmark!",
      });
      return res.redirect("/login");
    } else if (user) {
      return res.send(
        `<p>${user.username} already exist! <a href="/register">try different e-mail adress! </a></p>`,
      );
    }
  });
});

router.get("/", (req, res, next) => {
  res.send(
    '<h1>Home</h1><p>Please <a href="/login">login</a> or <a href="/register">register</a>',
  );
});

router.get("/login", (req, res, next) => {
  const form =
    '<h1>Login Page</h1><form method="POST" action="/login">\
  Username:<br><input type="text" name="uname">\
  <br>Password:<br><input type="password" name="pw">\
  <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

router.get("/register", (req, res, next) => {
  const form =
    '<h1>Register Page</h1><form method="post" action="register">\
                  E-mail:<br><input type="email" name="uname" required>\
                  <br>Password:<br><input type="password" name="pw" minlength="8" required>\
                  <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

router.get("/protected-route", isAuth, (req, res, next) => {
  res.send(
    '<h1>You are seeing Index text</h1><p><a href="/logout">Logout and reload</a></p>',
  );
});

// Visiting this route logs the user out
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/login");
});

router.get("/login-success", (req, res, next) => {
  res.send(
    '<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>',
  );
});

router.get("/login-failure", (req, res, next) => {
  res.send(
    '<p>You entered wrong login information. --> <a href="/login">Try again</a></p>',
  );
});

module.exports = router;
