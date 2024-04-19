const express = require("express");
const router = express.Router();
const OfficeController = require("../controllers/office-controller.js");

router.post("/office", OfficeController.create);
router.get("/office/:id", OfficeController.get);
router.get("/office", OfficeController.getAll);
router.patch("/office/:id", OfficeController.update);
router.delete("/office/:id", OfficeController.destroy);

module.exports = router;
