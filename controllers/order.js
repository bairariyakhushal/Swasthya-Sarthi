const Order = require("../models/order");
const Pharmacy = require("../models/pharmacy");
const User = require("../models/user");
const Razorpay = require("razorpay");
const crypto = require("crypto");

console.log('Key ID:', process.env.RAZORPAY_KEY); // Remove this after debugging

if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
  throw new Error('Razorpay credentials are not configured properly');
}


// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

// Helper function to validate and calculate order
const validateAndCalculateOrder = async (pharmacyId, medicines) => {
    const pharmacy = await Pharmacy.findById(pharmacyId).populate('owner');
    if (!pharmacy) {
        throw new Error("Pharmacy not found");
    }

    let totalAmount = 0;
    const orderMedicines = [];

    for (const medicine of medicines) {
        const { medicineName, quantity } = medicine;
        
        const inventoryItem = pharmacy.inventory.find(
            item => item.medicineName.toLowerCase() === medicineName.toLowerCase()
        );

        if (!inventoryItem) {
            throw new Error(`${medicineName} not available in this pharmacy`);
        }

        if (inventoryItem.stock < quantity) {
            throw new Error(`Insufficient stock for ${medicineName}. Available: ${inventoryItem.stock}`);
        }

        const medicineTotal = inventoryItem.sellingPrice * quantity;
        totalAmount += medicineTotal;

        orderMedicines.push({
            medicineName: inventoryItem.medicineName,
            quantity: quantity,
            price: inventoryItem.sellingPrice,
            total: medicineTotal
        });
    }

    return { pharmacy, orderMedicines, totalAmount };
};

// Step 1: Create Razorpay Order (before placing actual order)
exports.createPaymentOrder = async (req, res) => {
    try {
        const { pharmacyId, medicines, deliveryAddress, contactNumber } = req.body;
        const userId = req.user.id;

        // Validation
        if (!pharmacyId || !medicines || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Pharmacy and medicines are required"
            });
        }

        if (!deliveryAddress || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: "Delivery address and contact number are required"
            });
        }

        // Validate and calculate order
        const { pharmacy, orderMedicines, totalAmount } = await validateAndCalculateOrder(pharmacyId, medicines);

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: totalAmount * 100, // Amount in paise
            currency: "INR",
            receipt: `order_${Date.now()}`,
            notes: {
                pharmacyId: pharmacyId,
                userId: userId
            }
        });

        // Create our order in database (with pending payment)
        const order = new Order({
            customer: userId,
            pharmacy: pharmacyId,
            vendor: pharmacy.owner._id,
            medicines: orderMedicines,
            totalAmount: totalAmount,
            deliveryAddress: deliveryAddress,
            contactNumber: contactNumber,
            orderStatus: 'pending',
            paymentStatus: 'pending',
            razorpayOrderId: razorpayOrder.id
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order created, proceed to payment",
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount,
            key: process.env.RAZORPAY_KEY_ID,
            pharmacyName: pharmacy.name,
            medicines: orderMedicines
        });

    } catch (error) {
        console.error("Create payment order error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error creating payment order"
        });
    }
};

// Step 2: Verify payment and confirm order
exports.verifyPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderId 
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Find and update order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Update order with payment details
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        // Reduce pharmacy inventory
        const pharmacy = await Pharmacy.findById(order.pharmacy);
        for (const medicine of order.medicines) {
            const inventoryItem = pharmacy.inventory.find(
                item => item.medicineName.toLowerCase() === medicine.medicineName.toLowerCase()
            );
            if (inventoryItem) {
                inventoryItem.stock -= medicine.quantity;
            }
        }
        await pharmacy.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'firstName lastName email')
            .populate('pharmacy', 'name address')
            .populate('vendor', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: "Payment verified and order confirmed",
            order: populatedOrder
        });

    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: error.message
        });
    }
};

// Get user's orders (Order Status Tracking)
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let filter = { customer: userId };
        if (status) {
            filter.orderStatus = status;
        }

        const orders = await Order.find(filter)
            .populate('pharmacy', 'name address')
            .populate('vendor', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders: orders
        });

    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: error.message
        });
    }
};

// Get specific order details
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ _id: orderId, customer: userId })
            .populate('customer', 'firstName lastName email')
            .populate('pharmacy', 'name address')
            .populate('vendor', 'firstName lastName')
            .populate('volunteer', 'firstName lastName contactNumber');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            order: order
        });

    } catch (error) {
        console.error("Get order details error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching order details",
            error: error.message
        });
    }
};

// Vendor Order Management - Get vendor's orders
exports.getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { status } = req.query;

        let filter = { vendor: vendorId };
        if (status) {
            filter.orderStatus = status;
        }

        const orders = await Order.find(filter)
            .populate('customer', 'firstName lastName email contactNumber')
            .populate('pharmacy', 'name address')
            .populate('volunteer', 'firstName lastName contactNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders: orders
        });

    } catch (error) {
        console.error("Get vendor orders error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching vendor orders",
            error: error.message
        });
    }
};

// Update order status (vendor only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;
        const vendorId = req.user.id;

        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            });
        }

        const order = await Order.findOne({ _id: orderId, vendor: vendorId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or unauthorized"
            });
        }

        order.orderStatus = orderStatus;
        await order.save();

        const updatedOrder = await Order.findById(orderId)
            .populate('customer', 'firstName lastName email')
            .populate('pharmacy', 'name address')
            .populate('volunteer', 'firstName lastName contactNumber');

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order: updatedOrder
        });

    } catch (error) {
        console.error("Update order status error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating order status",
            error: error.message
        });
    }
};

// Cancel order (customer only)
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ _id: orderId, customer: userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order. Current status: ${order.orderStatus}`
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        // Restore pharmacy inventory
        const pharmacy = await Pharmacy.findById(order.pharmacy);
        for (const medicine of order.medicines) {
            const inventoryItem = pharmacy.inventory.find(
                item => item.medicineName.toLowerCase() === medicine.medicineName.toLowerCase()
            );
            if (inventoryItem) {
                inventoryItem.stock += medicine.quantity;
            }
        }
        await pharmacy.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order: order
        });

    } catch (error) {
        console.error("Cancel order error:", error);
        res.status(500).json({
            success: false,
            message: "Error cancelling order",
            error: error.message
        });
    }
};