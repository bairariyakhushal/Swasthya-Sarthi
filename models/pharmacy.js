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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
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
                type: Number,
                required: true
            }
        }
    ],
    // Admin approval fields
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    // Documents for verification
    licenseNumber: {
        type: String,
        required: true
    },
    licenseDocument: {
        type: String
    }, // URL to uploaded document
    gstNumber: {
        type: String
    },
    contactNumber: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Pharmacy', pharmacySchema);