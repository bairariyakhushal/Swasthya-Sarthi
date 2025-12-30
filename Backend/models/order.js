const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pharmacy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicines: [{
        medicineName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
    }],

    // NEW FIELDS - Delivery Type
    deliveryType: {
        type: String,
        enum: ['delivery', 'pickup'],
        required: true,
        default: 'delivery'
    },

    // Conditional fields based on delivery type
    deliveryAddress: {
        type: String,
        required: function () {
            return this.deliveryType === 'delivery';
        }
    },
    deliveryCoordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    contactNumber: {
        type: String,
        required: true
    },

    // Volunteer only for delivery orders
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    // Pricing
    medicineTotal: { type: Number, required: true },
    deliveryCharges: {
        type: Number
    },
    totalAmount: { type: Number, required: true },

    // Distance
    deliveryDistance: { type: Number }, // in km

    // Status Management
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'ready_for_pickup', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },

    // Pickup specific fields
    pickupCode: {
        type: String,
        required: function () {
            return this.deliveryType === 'pickup';
        }
    },
    readyForPickupAt: { type: Date },
    pickedUpByCustomerAt: { type: Date },

    // Delivery Timeline
    orderPlacedAt: { type: Date, default: Date.now },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },

    // Prescription fields
    needsPrescription: {
        type: Boolean,
        default: false
    },
    prescriptionImage: {
        type: String, // Cloudinary URL
        default: null
    },
    prescriptionStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: null
    },
    prescriptionNote: {
        type: String,
        default: null
    },

    // Razorpay fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);