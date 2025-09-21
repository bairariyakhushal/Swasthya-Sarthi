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
    
    // Delivery Information
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    deliveryCoordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    contactNumber: {
        type: String,
        required: true
    },
    
    // Pricing
    medicineTotal: { type: Number , required: true },
    deliveryCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    // Distance
    deliveryDistance: { type: Number }, // in km
    
    // Status Management
    orderStatus: { 
        type: String, 
        enum: ['pending', 'confirmed', 'assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    
    // Delivery Timeline
    orderPlacedAt: { type: Date, default: Date.now },
    assignedAt: { type: Date },
    pickedUpAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    
    // Razorpay fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);