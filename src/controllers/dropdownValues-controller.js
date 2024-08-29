const express = require('express');
const router = express.Router();
const dropdownValuesService = require('../services/dropdownValues-service');

const addOptions =  async (req, res) => {
  const { category, options } = req.body;
  try {
    const result = await dropdownValuesService.addOptions(category, options);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteOptions =   async (req, res) => {
  const { category, optionIds } = req.body;
  try {
    const result = await dropdownValuesService.deleteOptions(category, optionIds);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDropdownValues=  async (req, res) => {
  try {
    const result = await dropdownValuesService.getAllDropdownValues();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 const getDropdownValuesByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const result = await dropdownValuesService.getDropdownValuesByCategory(category);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    addOptions,
    deleteOptions,
    getAllDropdownValues,
    getDropdownValuesByCategory



};


 
