const { Office } = require("../models/index");

const OfficeRepository = {
  async createOffice({ name, password }) {
    try {
      const office = await Office.create({
        name,
        password,
      });
      return office;
    } catch (error) {
      console.log("Something went wrong in the repository layer");
      throw { error };
    }
  },

  async deleteOffice(officeId) {
    try {
      await Office.deleteOne({ _id: officeId });
      return true;
    } catch (error) {
      console.log("Something went wrong in the repository layer");
      throw { error };
    }
  },

  async updateOffice(officeId, data) {
    try {
      const office = await Office.findByIdAndUpdate(officeId, data, {
        new: true,
      });
      office.name = data.name;
      office.password = data.password; // If you need to update password
      await office.save(); // Save the changes to the database
      return office;
    } catch (error) {
      console.log("Something went wrong in the repository layer");
      throw { error };
    }
  },

  async getOffice(officeId) {
    try {
      const office = await Office.findById(officeId);
      return office;
    } catch (error) {
      console.log("Something went wrong in the repository layer");
      throw { error };
    }
  },

  async getAllOffices() {
    try {
      const offices = await Office.find({});
      return offices;
    } catch (error) {
      console.log("Something went wrong in the repository layer");
      throw { error };
    }
  },
};

module.exports = OfficeRepository;
