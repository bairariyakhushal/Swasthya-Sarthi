const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    GSTIN: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    pharmacies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pharmacy'
        }
    ],
    isApproved: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);