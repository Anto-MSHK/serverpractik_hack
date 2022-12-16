const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
  },
  password: {
    type: String,
  },
  birthday: {
    type: String,
  },
  role: {
    type: String,
    ref: "Role",
  },
  activationLink: {
    type: String,
  },
  department: {
    type: String,
  },
  isAccessHight: {
    type: Boolean,
  },
});

module.exports = model("User", UserSchema);
