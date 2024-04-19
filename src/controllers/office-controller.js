const OfficeService = require("../services/office-service");

const OfficeController = {
  async create(req, res) {
    console.log(req.body);
    const { name, password } = req.body;
    console.log({ name, password });

    try {
      const office = await OfficeService.createOffice({ name, password });
      res.status(201).json(office);
    } catch (error) {
      console.error("Error creating office:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async destroy(req, res) {
    const officeId = req.params.id;
    try {
      await OfficeService.deleteOffice(officeId);
      res.json({ message: "Office deleted successfully" });
    } catch (error) {
      console.error("Error deleting office:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async update(req, res) {
    const officeId = req.params.id;
    const newData = req.body;
    try {
      const updatedOffice = await OfficeService.updateOffice(officeId, newData);
      res.json(updatedOffice);
    } catch (error) {
      console.error("Error updating office:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async get(req, res) {
    const officeId = req.params.id;
    console.log(officeId);
    try {
      const office = await OfficeService.getOffice(officeId);
      if (!office) {
        return res.status(404).json({ message: "Office not found" });
      }
      res.json(office);
    } catch (error) {
      console.error("Error getting office:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async getAll(req, res) {
    try {
      const offices = await OfficeService.getAllOffices();
      res.json(offices);
    } catch (error) {
      console.error("Error getting all offices:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = OfficeController;
