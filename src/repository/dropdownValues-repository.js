const DropdownValues = require('../models/dropdownValues');

class DropdownValuesRepository {
  async createOrUpdate(category, options) {
    return DropdownValues.findOneAndUpdate(
      { category },
      { $push: { options: { $each: options } } },
      { new: true, upsert: true }
    );
  }

  async deleteOptions(category, optionIds) {
    return DropdownValues.updateOne(
      { category },
      { $pull: { options: { id: { $in: optionIds } } } }
    );
  }

  async findAll() {
    return DropdownValues.find();
  }

  async findByCategory(category) {
    return DropdownValues.findOne({ category });
  }
}

module.exports = new DropdownValuesRepository();
