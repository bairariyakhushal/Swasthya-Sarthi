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
    medicines: [
        {
            medicine: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Medicine', 
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true 
            },
            price: { 
                type: Number, 
                required: true 
            }
        }
    ],
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'declined', 'delivered'], 
        default: 'pending' 
    },
    deliveryType: { 
        type: String, 
        enum: ['pickup', 'volunteer'], 
        required: true 
    },
    volunteer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid'], 
        default: 'pending' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);