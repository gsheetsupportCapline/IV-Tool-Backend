const express = require('express');
const router = express.Router();
const dropdownValuesService = require('../services/dropdownValues-service');

const addOptions =  async (req, res) => {
  
  try {
    const { category, options } = req.body;
    const result = await dropdownValuesService.addOptions(category, options);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in addOptions:', error.message);
    res.status(500).json({ error: 'Failed to add options' });
  }
};
const deleteOptions =   async (req, res) => {
  
  try {
    const { category, optionIds } = req.body;
    const result = await dropdownValuesService.deleteOptions(category, optionIds);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in deleteOptions:', error.message);
    res.status(500).json({ error: 'Failed to delete options' });
  }
};

const getAllDropdownValues=  async (req, res) => {
  try {
    const result = await dropdownValuesService.getAllDropdownValues();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAllDropdownValues:', error.message);
    res.status(500).json({ error: 'Failed to retrieve all dropdown values' });
  }
};

 const getDropdownValuesByCategory = async (req, res) => {
  
  try {
    const { category } = req.params;
    const result = await dropdownValuesService.getDropdownValuesByCategory(category);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getDropdownValuesByCategory:', error.message);
    res.status(500).json({ error: `Failed to retrieve dropdown values for category ${category}` });
  }
};

module.exports = {
    addOptions,
    deleteOptions,
    getAllDropdownValues,
    getDropdownValuesByCategory
};


 
