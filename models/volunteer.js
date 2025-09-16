const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    drivingLicense: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    vehicle: {
        type: String,
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    deliveryHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    deliveryCharge: {
        type: Number,
    }, // can be set per delivery or per km
},
    { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
