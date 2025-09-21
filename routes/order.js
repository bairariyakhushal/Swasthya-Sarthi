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
    trackOrder
} = require("../controllers/order");
const { auth, isVendor } = require("../middlewares/auth");

// Payment & Order routes
router.post("/create-payment-order", auth, createPaymentOrder);
router.post("/verify-payment", auth, verifyPayment);

// Customer routes
router.get("/my-orders", auth, getUserOrders);
router.get("/:orderId", auth, getOrderDetails);
router.put("/cancel/:orderId", auth, cancelOrder);
router.get("/track/:orderId", auth, trackOrder);

// Vendor routes
router.get("/vendor/orders", auth, isVendor, getVendorOrders);
router.put("/vendor/status/:orderId", auth, isVendor, updateOrderStatus);

module.exports = router;