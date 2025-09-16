const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        } // [longitude, latitude]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // Vendor
    // Simple inventory array for each pharmacy
    inventory: [
        {
            medicineName: { 
                type: String, 
                required: true 
            },
            sellingPrice: { 
                type: Number, 
                required: true 
            },
            stock: { 
                type: Number, 
                required: true 
            },
            purchasePrice: { 
                type: Number 
            },// Vendor's cost price
            // Vendor's selling price
        }
    ]
}, { timestamps: true });

pharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', pharmacySchema);