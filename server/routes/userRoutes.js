const express = require("express");
const router = express.Router();
const { getUserById } = require("../controllers/authController");

router.get("/:id", getUserById); // Handles /api/users/:id

module.exports = router;
