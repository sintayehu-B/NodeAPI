const { Schema, model } = require("mongoose");
const moment = require("moment");
const UserSchema = new Schema({
  first_name: {
    type: String,
    required: false,
  },
  last_name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "anotherRole"],
  },
  username: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  date_created: {
    type: Date,
    default: moment.utc().valueOf(),
  }
});
module.exports = model("users", UserSchema);
