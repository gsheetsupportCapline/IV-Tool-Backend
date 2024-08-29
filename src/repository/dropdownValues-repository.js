const DropdownValues = require('../models/dropdownValues');

class DropdownValuesRepository {
  async createOrUpdate(category, options) {
    try{
        return await DropdownValues.findOneAndUpdate(
            { category },
            { $push: { options: { $each: options } } },
            { new: true, upsert: true }
          );
    }catch(error){
        throw new Error(`Failed to create or update dropdown values for category ${category}: ${error.message}`);
    }

  }

  async deleteOptions(category, optionIds) {
    try{
        return await DropdownValues.updateOne(
            { category },
            { $pull: { options: { id: { $in: optionIds } } } }
          );
    }catch(error){
        throw new Error(`Failed to delete options for category ${category}: ${error.message}`);
    }
   
  }

  async findAll() {
    try{
        return await DropdownValues.find();
    }catch(error){
        throw new Error(`Failed to retrieve all dropdown values: ${error.message}`);
    }
   
  }

  async findByCategory(category) {
    try{
        return await DropdownValues.findOne({ category });
    }catch(error){
        throw new Error(`Failed to find dropdown values for category ${category}: ${error.message}`); 
    }
    
  }
}

module.exports = new DropdownValuesRepository();
