const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        vehicleType: {
            type: String,
            enum: ["bicycle", "motorcycle", "car", "auto"],
            required: true,
        },
        vehicleNumber: {
            type: String,
            required: true
        },
        drivingLicense: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true,
            min: 18
        },
        currentLocation: {
            latitude: { type: Number },
            longitude: { type: Number },
        },
        serviceArea: {
            radius: {
                type: Number,
                default: 10 // km
            }, 
            city: {
                type: String,
                required: true
            },
        },
        isAvailable: {
            type: Boolean,
            default: true
        },

        // Admin approval fields
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        approvedAt: {
            type: Date
        },
        rejectionReason: {
            type: String
        },

        // Verification documents
        drivingLicenseDocument: { type: String }, // URL
        aadharDocument: { type: String }, // URL
        profilePhoto: { type: String }, // URL

        // Performance metrics
        totalDeliveries: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0
        },
        activeOrders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order"
            }
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
