const express = require("express");
const router = express.Router();

const {
    createPaymentOrder,
    verifyPayment,
    getUserOrders,
    getOrderDetails,
    getVendorOrders,
    updateOrderStatus,
    cancelOrder,
    trackOrder,
    verifyPrescription
} = require("../controllers/order");
const { auth, isVendor,isCustomer } = require("../middlewares/auth");

// Payment & Order routes
router.post("/create-payment-order", auth,isCustomer,createPaymentOrder);
router.post("/verify-payment", auth, verifyPayment);

// Customer routes
router.get("/my-orders", auth, isCustomer,getUserOrders);
router.get("/my-orders/:status", auth, isCustomer,getUserOrders);
router.get("/:orderId", auth, getOrderDetails);
router.put("/cancel/:orderId", auth, cancelOrder);
router.get("/track/:orderId", auth, trackOrder);

// Vendor routes
router.get("/vendor/orders", auth, isVendor, getVendorOrders);
router.get("/vendor/orders/:status", auth, isVendor, getVendorOrders); // Status-wise orders
router.put("/vendor/status/:orderId", auth, isVendor, updateOrderStatus);
router.put("/verify-prescription/:orderId", auth, isVendor, verifyPrescription);

module.exports = router;