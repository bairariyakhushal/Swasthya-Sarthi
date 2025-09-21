const express = require("express");
const router = express.Router();
const { registerPharmacy,
    updateInventory,
    searchMedicine,
    getLocationCoordinates,
    markOrderReadyForPickup,      
    confirmCustomerPickup
} = require("../controllers/pharmacy");

const { auth, isVendor } = require("../middlewares/auth");

// Convert address/city to coordinates for manual location selection
router.get("/location", getLocationCoordinates);

// Enhanced medicine search - handles all scenarios
router.get("/search", searchMedicine);

// Vendor registers a pharmacy
router.post("/register", auth, isVendor, registerPharmacy);

// Update pharmacy inventory (vendor only)
router.post("/inventory/:pharmacyId", auth, isVendor, updateInventory);

// Pickup Management
router.put("/order/:orderId/ready-for-pickup", auth, isVendor, markOrderReadyForPickup);
router.put("/order/:orderId/confirm-pickup", auth, isVendor, confirmCustomerPickup);


module.exports = router;