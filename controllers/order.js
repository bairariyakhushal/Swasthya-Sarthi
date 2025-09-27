const Order = require("../models/order");
const Pharmacy = require("../models/pharmacy");
const User = require("../models/user");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const mailTemplates = require('../mail_templates/templates');
const cloudinary = require("cloudinary").v2;

if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
    throw new Error('Razorpay credentials are not configured properly');
}

const SENSITIVE_MEDICINES = [
    'antibiotics', 'antibiotic', 'amoxicillin', 'azithromycin', 'ciprofloxacin',
    'insulin', 'metformin', 'warfarin', 'morphine', 'codeine', 'tramadol',
    'diazepam', 'lorazepam', 'alprazolam', 'cough syrup with codeine'
];


// Helper function to check if any medicine requires prescription
function checkIfPrescriptionRequired(medicines) {
    return medicines.some(medicine => {
        return SENSITIVE_MEDICINES.some(sensitive =>
            medicine.medicineName.toLowerCase().includes(sensitive.toLowerCase())
        );
    });
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Helper function to calculate delivery charges
function calculateDeliveryCharges(distance) {
    // Delivery charge structure
    if (distance <= 2) return 20;        // ≤2km: ₹20
    if (distance <= 5) return 30;        // 2-5km: ₹30
    if (distance <= 10) return 50;       // 5-10km: ₹50
    if (distance <= 15) return 70;       // 10-15km: ₹70
    return Math.ceil(distance * 5);      // >15km: ₹5/km
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

// Helper function to parse medicines from different formats
function parseMedicinesFromRequest(req) {
    let medicines = [];
    
    // Method 1: If medicines is already an array (direct API call)
    if (Array.isArray(req.body.medicines)) {
        medicines = req.body.medicines;
    }
    // Method 2: If medicines is a JSON string (form-data)
    else if (req.body.medicines && typeof req.body.medicines === 'string') {
        try {
            medicines = JSON.parse(req.body.medicines);
        } catch (e) {
            throw new Error("Invalid medicines format. Please provide valid JSON array.");
        }
    }
    // Method 3: If no medicines found
    else {
        throw new Error("Medicines array is required");
    }

    // Validate that it's actually an array
    if (!Array.isArray(medicines)) {
        throw new Error("Medicines must be an array");
    }

    return medicines;
}

// Step 1: Create Razorpay Order (before placing actual order)
exports.createPaymentOrder = async (req, res) => {
    try {
        // Check file using express-fileupload format
        console.log("Files:", req.files);

        let prescriptionFile = null;
        if (req.files && req.files.file) {
            prescriptionFile = req.files.file;
            console.log("Prescription file found:", prescriptionFile.name);
        }

        const {
            pharmacyId,
            deliveryType,
            deliveryAddress,        // Optional for pickup
            contactNumber,
            deliveryCoordinates,    // Optional for pickup
        } = req.body;

        // Parse medicines from request (FIXED)
        let medicines;
        try {
            medicines = parseMedicinesFromRequest(req);
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                message: parseError.message
            });
        }

        const userId = req.user.id;

        // Validation
        if (!pharmacyId || !medicines || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Pharmacy and medicines are required"
            });
        }

        if (!deliveryType || !['delivery', 'pickup'].includes(deliveryType)) {
            return res.status(400).json({
                success: false,
                message: "Delivery type must be 'delivery' or 'pickup'"
            });
        }

        // Delivery specific validation
        if (deliveryType === 'delivery') {
            if (!deliveryAddress || !contactNumber) {
                return res.status(400).json({
                    success: false,
                    message: "Delivery address and contact number are required for delivery orders"
                });
            }
        }

        // Check if any medicine needs prescription
        const needsPrescription = checkIfPrescriptionRequired(medicines);

        // If prescription needed but not uploaded
        if (needsPrescription && !prescriptionFile) {
            return res.status(400).json({
                success: false,
                message: "Prescription image required for sensitive medicines",
                needsPrescription: true,
                sensitiveMedicines: medicines.filter(m =>
                    SENSITIVE_MEDICINES.some(s =>
                        m.medicineName.toLowerCase().includes(s.toLowerCase())
                    )
                ).map(m => m.medicineName)
            });
        }

        // Validate and calculate order
        const { pharmacy, orderMedicines, totalAmount } = await validateAndCalculateOrder(pharmacyId, medicines);

        // Calculate delivery charges (0 for pickup)
        let deliveryCharges = 0;
        let finalAmount = totalAmount;

        if (deliveryType === 'delivery' && deliveryCoordinates) {
            // Calculate delivery charges based on distance
            const distance = calculateDistance(
                pharmacy.coordinates.latitude, pharmacy.coordinates.longitude,
                deliveryCoordinates.latitude, deliveryCoordinates.longitude
            );
            deliveryCharges = calculateDeliveryCharges(distance);
            finalAmount = totalAmount + deliveryCharges;
        }

        // Upload prescription if provided
        let prescriptionUrl = null;
        if (prescriptionFile) {
            const uploadResult = await cloudinary.uploader.upload(prescriptionFile.tempFilePath, {
                folder: "Swasthy Sarthi"
            });
            prescriptionUrl = uploadResult.secure_url;
        }

        // Generate pickup code for in-store pickup
        let pickupCode = null;
        if (deliveryType === 'pickup') {
            pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: finalAmount * 100, // Amount in paise
            currency: "INR",
            receipt: `order_${Date.now()}`,
            notes: {
                pharmacyId: pharmacyId,
                userId: userId,
                deliveryType: deliveryType
            }
        })

        // Create our order in database
        const order = new Order({
            customer: userId,
            pharmacy: pharmacyId,
            vendor: pharmacy.owner._id,
            medicines: orderMedicines,
            deliveryType: deliveryType,
            medicineTotal: totalAmount,
            deliveryCharges: deliveryCharges,
            totalAmount: finalAmount,
            contactNumber: contactNumber,
            orderStatus: needsPrescription ? 'pending' : 'pending',
            paymentStatus: 'pending',
            razorpayOrderId: razorpayOrder.id,
            orderPlacedAt: new Date(),

            // Prescription fields
            needsPrescription: needsPrescription,
            prescriptionImage: prescriptionUrl,
            prescriptionStatus: needsPrescription ? 'pending' : null,


            // Conditional fields
            ...(deliveryType === 'delivery' && {
                deliveryAddress: deliveryAddress,
                deliveryCoordinates: deliveryCoordinates || null
            }),
            ...(deliveryType === 'pickup' && {
                pickupCode: pickupCode
            })
        });

        await order.save();

        res.status(200).json({
            success: true,
            message: needsPrescription ?
                "Order created - waiting for prescription verification" :
                "Order created - proceed to payment", orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: finalAmount,
            deliveryType: deliveryType,
            deliveryCharges: deliveryCharges,
            pickupCode: pickupCode, // Only for pickup orders
            key: process.env.RAZORPAY_KEY,
            pharmacyName: pharmacy.name,
            medicines: orderMedicines,
            needsPrescription,
            prescriptionUrl,
            prescriptionStatus: needsPrescription ? 'pending_verification' : 'not_required',
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

        // Send order confirmation email
        try {
            const customer = await User.findById(order.customer);
            const pharmacy = await Pharmacy.findById(order.pharmacy);

            if (customer && pharmacy) {
                const emailContent = mailTemplates.orderConfirmationEmail(
                    customer.firstName,
                    order,
                    pharmacy
                );

                await mailSender(
                    customer.email,
                    "Order Confirmed - Swasthya Sarthi",
                    emailContent
                );
                console.log("Order confirmation email sent to:", customer.email);
            }
        } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
        }

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
        
        // Get status from query parameter OR URL parameter (both supported)
        const status = req.params.status || req.query.status;

        console.log("Customer ID:", userId);
        console.log("Requested Status:", status);

        // Build filter - vendor ke orders
        let filter = { customer : userId };
        
        // Add status filter only if provided and not 'all'
        if (status && status !== 'all') {
            filter.orderStatus = status;
        }

        console.log("Filter:", filter);

        const orders = await Order.find(filter)
            .populate('pharmacy', 'name address')
            .populate('vendor', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            requestedStatus: status || 'all',
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
        
        // Get status from query parameter OR URL parameter (both supported)
        const status = req.params.status || req.query.status;
        
        console.log("Vendor ID:", vendorId);
        console.log("Requested Status:", status);

        // Build filter - vendor ke orders
        let filter = { vendor: vendorId };
        
        // Add status filter only if provided and not 'all'
        if (status && status !== 'all') {
            filter.orderStatus = status;
        }

        console.log("Filter:", filter);

        const orders = await Order.find(filter)
            .populate('customer', 'firstName lastName email contactNumber')
            .populate('pharmacy', 'name address')
            .populate('volunteer', 'firstName lastName contactNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            requestedStatus: status || 'all',
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

// Update trackOrder function in controllers/order.js
exports.trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.id;

        const order = await Order.findOne({
            _id: orderId,
            customer: customerId
        })
            .populate('pharmacy', 'name address coordinates contactNumber')
            .populate('volunteer', 'firstName lastName contactNumber vehicleType vehicleNumber currentLocation')
            .populate('customer', 'firstName lastName contactNumber');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        console.log('Order Pharmacy:', order.pharmacy);

        // Calculate progress percentage
        const statusProgress = {
            'pending': 10,
            'confirmed': 25,
            'assigned': 40,
            'picked_up': 60,
            'out_for_delivery': 80,
            'delivered': 100,
            'ready_for_pickup': 75,
            'completed': 100,
            'cancelled': 0
        };
        const progressPercentage = statusProgress[order.orderStatus] || 0;


        const trackingInfo = {
            orderId: order._id,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            deliveryType: order.deliveryType || 'delivery',
            progressPercentage,

            // Customer Info
            customer: order.customer ? {
                name: `${order.customer.firstName} ${order.customer.lastName}`,
                contact: order.customer.contactNumber
            } : null,

            // Order Details
            medicines: order.medicines,

            // Pharmacy Details (Fixed)
            pharmacy: order.pharmacy ? {
                name: order.pharmacy.name,
                address: order.pharmacy.address,
                contact: order.pharmacy.contactNumber,
                coordinates: order.pharmacy.coordinates
            } : null,

            // Delivery/Pickup Info
            deliveryAddress: order.deliveryAddress,
            pickupCode: order.pickupCode,
            contactNumber: order.contactNumber,

            // Distance & Pricing
            deliveryDistance: order.deliveryDistance ? parseFloat(order.deliveryDistance.toFixed(2)) : null,
            deliveryCharges: order.deliveryCharges || 0,
            medicineTotal: order.medicineTotal,
            totalAmount: order.totalAmount,

            // Timing
            orderPlacedAt: order.orderPlacedAt,

            // Timeline (Enhanced)
            timeline: {
                orderPlaced: {
                    timestamp: order.orderPlacedAt,
                    status: 'completed',
                    message: 'Order placed successfully'
                },
                confirmed: {
                    timestamp: order.orderStatus !== 'pending' ? order.updatedAt : null,
                    status: order.orderStatus !== 'pending' ? 'completed' : 'pending',
                    message: order.orderStatus !== 'pending' ? 'Order confirmed by pharmacy' : 'Waiting for pharmacy confirmation'
                },
                assigned: {
                    timestamp: order.assignedAt,
                    status: order.assignedAt ? 'completed' :
                        ['assigned', 'picked_up', 'out_for_delivery', 'delivered'].includes(order.orderStatus) ? 'completed' : 'pending',
                    message: order.assignedAt ? 'Assigned to delivery partner' : 'Waiting for delivery partner assignment'
                },
                pickedUp: {
                    timestamp: order.pickedUpAt,
                    status: order.pickedUpAt ? 'completed' :
                        ['picked_up', 'out_for_delivery', 'delivered'].includes(order.orderStatus) ? 'completed' : 'pending',
                    message: order.pickedUpAt ? 'Order picked up from pharmacy' : 'Waiting for pickup'
                },
                outForDelivery: {
                    timestamp: order.outForDeliveryAt,
                    status: order.outForDeliveryAt ? 'completed' :
                        ['out_for_delivery', 'delivered'].includes(order.orderStatus) ? 'completed' : 'pending',
                    message: order.outForDeliveryAt ? 'Order is out for delivery' : 'Waiting for dispatch'
                },
                delivered: {
                    timestamp: order.deliveredAt,
                    status: order.deliveredAt ? 'completed' :
                        order.orderStatus === 'delivered' ? 'completed' : 'pending',
                    message: order.deliveredAt ? 'Order delivered successfully' : 'Delivery pending'
                }
            }
        };

        // Add volunteer info for delivery orders
        if (order.deliveryType === 'delivery' && order.volunteer) {
            trackingInfo.volunteer = {
                name: `${order.volunteer.firstName} ${order.volunteer.lastName}`,
                contact: order.volunteer.contactNumber,
                vehicleType: order.volunteer.vehicleType,
                vehicleNumber: order.volunteer.vehicleNumber,
                currentLocation: order.volunteer.currentLocation
            };
        }

        // Add pickup specific info
        if (order.deliveryType === 'pickup') {
            trackingInfo.pickup = {
                code: order.pickupCode,
                readyAt: order.readyForPickupAt,
                pickedUpAt: order.pickedUpByCustomerAt,
                status: order.orderStatus === 'ready_for_pickup' ? 'Ready for pickup' :
                    order.orderStatus === 'completed' ? 'Completed' : 'Preparing'
            };
        }

        res.status(200).json({
            success: true,
            tracking: trackingInfo
        });

    } catch (error) {
        console.error("Track order error:", error);
        res.status(500).json({
            success: false,
            message: "Error tracking order",
            error: error.message
        });
    }
};

// Verify prescription (vendor only)
exports.verifyPrescription = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { action, reason } = req.body; // action: 'approve' or 'reject'
        const vendorId = req.user.id;

        // Find order and verify vendor ownership
        const order = await Order.findById(orderId)
            .populate('pharmacy', 'owner')
            .populate('customer', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.pharmacy.owner.toString() !== vendorId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access"
            });
        }

        if (!order.needsPrescription) {
            return res.status(400).json({
                success: false,
                message: "This order doesn't need prescription"
            });
        }

        if (order.prescriptionStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Prescription already verified"
            });
        }

        // Update prescription status
        if (action === 'approve') {
            order.prescriptionStatus = 'approved';
            order.orderStatus = 'pending'; // Move to regular order flow
        } else if (action === 'reject') {
            order.prescriptionStatus = 'rejected';
            order.orderStatus = 'cancelled';
        } else {
            return res.status(400).json({
                success: false,
                message: "Action must be 'approve' or 'reject'"
            });
        }

        order.prescriptionNote = reason;
        await order.save();

        res.status(200).json({
            success: true,
            data: {
                orderId: order._id,
                action,
                prescriptionStatus: order.prescriptionStatus,
                orderStatus: order.orderStatus,
                customerName: `${order.customer.firstName} ${order.customer.lastName}`
            },
            message: `Prescription ${action}d successfully`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error verifying prescription"
        });
    }
};