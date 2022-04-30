const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
var passport = require("passport");
var crypto = require("crypto");
var routes = require("./routes");
const connection = require("./config/database");

const MongoStore = require("connect-mongo");

require("dotenv").config();

const app = express();

const dbString = process.env.MONGO_DB;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = new MongoStore({
  mongoUrl: dbString,
  mongooseConnection: connection,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

app.listen(3001);
