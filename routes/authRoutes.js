const express = require("express");
const router = express.Router();

// Import auth controllers
const {
    signup,
    login,
    sendOTP,
    changePassword,
} = require("../controllers/authController");

// Import middleware
const { auth } = require("../middlewares/auth");

// Authentication routes
router.post("/sendotp", sendOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/changepassword", auth, changePassword);

module.exports = router;