const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Office = mongoose.model("Office", officeSchema);

module.exports = Office;
