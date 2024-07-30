const { OfficeRepository } = require("../repository/index");

const officeService = {
  async createOffice(data) {
    try {
      return await OfficeRepository.createOffice(data);
    } catch (error) {
      console.log("Something went wrong at service layer:", error);
      throw { error };
    }
  },

  async deleteOffice(officeId) {
    try {
      return await OfficeRepository.deleteOffice(officeId);
    } catch (error) {
      console.log("Something went wrong at service layer:", error);
      throw { error };
    }
  },

  async updateOffice(officeId, data) {
    try {
      return await OfficeRepository.updateOffice(officeId, data);
    } catch (error) {
      console.log("Something went wrong at service layer:", error);
      throw { error };
    }
  },

  async getOffice(officeId) {
    try {
      return await OfficeRepository.getOffice(officeId);
    } catch (error) {
      console.log("Something went wrong at service layer:", error);
      throw { error };
    }
  },

  async getAllOffices() {
    try {
      return await OfficeRepository.getAllOffices();
    } catch (error) {
      console.log("Something went wrong at service layer:", error);
      throw { error };
    }
  },
};

module.exports = officeService;
