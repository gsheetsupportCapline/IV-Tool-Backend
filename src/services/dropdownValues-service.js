const dropdownValuesRepository = require('../repository/dropdownValues-repository');

class DropdownValuesService {
  async addOptions(category, options) {
    try{
        return await  dropdownValuesRepository.createOrUpdate(category, options);
    }catch(error){
        throw new Error(`Failed to add options for category ${category}: ${error.message}`);
    }
    
  }

  async deleteOptions(category, optionIds) {
    try{
        return  await dropdownValuesRepository.deleteOptions(category, optionIds);
    }catch(error){
        throw new Error(`Failed to delete options for category ${category} with IDs ${optionIds.join(',')} : ${error.message}`); 
    }
   
  }

  async getAllDropdownValues() {
    try{
        return await dropdownValuesRepository.findAll();
    }catch(error){
        throw new Error(`Failed to retrieve all dropdown values: ${error.message}`);
    }
    
  }

  async getDropdownValuesByCategory(category) {
    try{
        return await dropdownValuesRepository.findByCategory(category);
    }catch(error){
        throw new Error(`Failed to retrieve dropdown values for category ${category}: ${error.message}`);
    }
   
  }
}

module.exports = new DropdownValuesService();
