const dropdownValuesRepository = require('../repository/dropdownValues-repository');

class DropdownValuesService {
  async addOptions(category, options) {
    return dropdownValuesRepository.createOrUpdate(category, options);
  }

  async deleteOptions(category, optionIds) {
    return dropdownValuesRepository.deleteOptions(category, optionIds);
  }

  async getAllDropdownValues() {
    return dropdownValuesRepository.findAll();
  }

  async getDropdownValuesByCategory(category) {
    return dropdownValuesRepository.findByCategory(category);
  }
}

module.exports = new DropdownValuesService();
