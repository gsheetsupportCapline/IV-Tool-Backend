const express = require('express');
const router = express.Router();
const { updateUserDetails } = require('../models/user'); // Adjust path if needed
// console.log('updateUserDetails:', updateUserDetails);
// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await updateUserDetails(req.params.id, req.body);
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;