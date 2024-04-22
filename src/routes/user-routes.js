const express = require("express");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

router.get("/profile", authenticate, (req, res) => {
  console.log(req.user);
  res.json({ message: `Welcome ${req.user.name}` });
});

module.exports = router;
