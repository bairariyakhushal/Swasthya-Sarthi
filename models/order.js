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
    medicines: [
        {
            medicineName: { 
                type: String, 
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true 
            },
            price: { 
                type: Number, 
                required: true 
            },
            total: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: { 
        type: Number, 
        required: true 
    },
    orderStatus: { 
        type: String, 
        enum: ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    volunteer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    // Razorpay fields
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);