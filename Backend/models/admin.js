const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Add any admin-specific fields here if needed
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);