const express = require("express");
const router = express.Router();
const {
    getAvailableOrders,
    acceptOrder,
    markPickupComplete,
    markOutForDelivery,
    markDeliveryComplete,
    getMyDeliveries,
    updateLocation,
    toggleAvailability,
    getVolunteerProfile
} = require("../controllers/volunteer");
const { auth, isVolunteer } = require("../middlewares/auth");

// Volunteer delivery management
router.get("/available-orders", auth, isVolunteer, getAvailableOrders);
router.put("/accept-order/:orderId", auth, isVolunteer, acceptOrder);
router.put("/pickup-complete/:orderId", auth, isVolunteer, markPickupComplete);
router.put("/out-for-delivery/:orderId", auth, isVolunteer, markOutForDelivery);
router.put("/delivery-complete/:orderId", auth, isVolunteer, markDeliveryComplete);
router.get("/my-deliveries", auth, isVolunteer, getMyDeliveries);
router.put("/location", auth, isVolunteer, updateLocation);
router.put("/availability", auth, isVolunteer, toggleAvailability);
router.get("/profile", auth, isVolunteer, getVolunteerProfile);
module.exports = router;