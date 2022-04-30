const mongoose = require("mongoose");

require("dotenv").config();

const dbString = process.env.MONGO_DB;
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connection = mongoose.createConnection(dbString, dbOptions);

const UserSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String,
});

const User = connection.model("User", UserSchema);

module.exports = connection;
