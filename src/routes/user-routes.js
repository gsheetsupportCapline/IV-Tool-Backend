const express = require("express");
const { authenticate } = require("../middlewares/auth");
// const { getAllUsers } = require("../controllers/user-controller");
const router = express.Router();

router.get("/profile", authenticate, (req, res) => {
  console.log(req.user);
  res.json({ message: `Welcome ${req.user.name}` });
});

// router.get("/users", getAllUsers);

module.exports = router;
