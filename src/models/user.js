const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name cannot be empty"],
  },
  password: {
    type: String,
    required: [true, "Password cannot be empty"],
    set: (value) => bcrypt.hashSync(value, 10),
  },
  emp_code: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: [true, "Email cannot be empty"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
