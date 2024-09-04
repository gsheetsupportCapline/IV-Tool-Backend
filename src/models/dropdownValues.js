const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DropdownValuesSchema = new Schema({
  category: { type: String, required: true, unique: true },
  options: [
    {
      id: { type: Number, required: true },
      name: { type: String, required: true }
    }
  ]
});

const DropdownValues = mongoose.model('DropdownValues', DropdownValuesSchema);
module.exports = DropdownValues;
