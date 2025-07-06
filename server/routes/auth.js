const express = require("express");
const { registerUser, loginUser, getUserById } = require("../controllers/authController");
const router = express.Router();

router.get("/user/:id", getUserById);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
