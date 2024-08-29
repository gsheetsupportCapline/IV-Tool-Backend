const express = require("express");
const router = express.Router();
const DropdownValuesController = require("../controllers/dropdownValues-controller");

router.post("/add", DropdownValuesController.addOptions);
router.get("/:category", DropdownValuesController.getDropdownValuesByCategory);
router.get("/", DropdownValuesController.getAllDropdownValues);
 router.delete("/delete", DropdownValuesController.deleteOptions);

module.exports = router;
