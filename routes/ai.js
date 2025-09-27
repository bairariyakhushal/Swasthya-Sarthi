const express = require("express");
const router = express.Router();

const {
    getMedicineInfo,
    getSymptomSuggestion
} = require("../controllers/aiController");

const { auth } = require("../middlewares/auth");

// AI Routes
router.post("/medicine-info", auth, getMedicineInfo);
router.post("/symptom-suggestion", auth, getSymptomSuggestion);

module.exports = router;