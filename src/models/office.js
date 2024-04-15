const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema({
  officeName: {
    type: String,
    required: [true, "Office Name cannot be empty"],
  },
  officePassword: {
    type: String,
    required: [true, "Office Password cannot be empty"],
  },
});

const Office = mongoose.model("Office", officeSchema);

module.exports = Office;
