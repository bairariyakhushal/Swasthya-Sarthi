const express = require("express");
const router = express.Router();

const {
    getVendorPharmacies,
    getPharmacyDashboard,
    getPharmacySalesReport,
    getTopMedicines
} = require("../controllers/vendorAnalytics");

const { auth, isVendor } = require("../middlewares/auth");

// Simple vendor routes
router.get("/pharmacies", auth, isVendor, getVendorPharmacies);
router.get("/pharmacy/:pharmacyId/dashboard", auth, isVendor, getPharmacyDashboard);
router.get("/pharmacy/:pharmacyId/sales", auth, isVendor, getPharmacySalesReport);
router.get("/pharmacy/:pharmacyId/top-medicines", auth, isVendor, getTopMedicines);

module.exports = router;