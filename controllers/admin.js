const Pharmacy = require('../models/pharmacy');
const Volunteer = require('../models/volunteer');
const User = require('../models/user');
const Order = require('../models/order');
const mailTemplates = require('../mail_templates/templates');
const mailSender = require('../utils/mailSender');

// Get pending pharmacy approvals
exports.getPendingPharmacies = async (req, res) => {
    try {
        const pendingPharmacies = await Pharmacy.find({ approvalStatus: 'pending' })
            .populate('owner', 'firstName lastName email contactNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalPending: pendingPharmacies.length,
            pharmacies: pendingPharmacies
        });
    } catch (error) {
        console.error("Get pending pharmacies error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching pending pharmacies",
            error: error.message
        });
    }
};

// Approve/Reject pharmacy
exports.updatePharmacyApproval = async (req, res) => {
    try {
        const { pharmacyId } = req.params;
        const { approvalStatus, rejectionReason } = req.body;
        const adminId = req.user.id;

        if (approvalStatus === 'rejected' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required when rejecting"
            });
        }

        const pharmacy = await Pharmacy.findById(pharmacyId);
        if (!pharmacy) {
            return res.status(404).json({
                success: false,
                message: "Pharmacy not found"
            });
        }

        pharmacy.approvalStatus = approvalStatus;
        pharmacy.approvedBy = adminId;
        pharmacy.approvedAt = new Date();
        
        if (approvalStatus === 'rejected') {
            pharmacy.rejectionReason = rejectionReason;
        }

        // Send email
        try {
            const vendor = await User.findById(pharmacy.owner);
            
            if (vendor) {
                const emailContent = mailTemplates.adminApprovalEmail(
                    vendor.firstName,
                    'Pharmacy',
                    approvalStatus,
                    rejectionReason
                );
                
                await mailSender(
                    vendor.email,
                    `Pharmacy Application ${approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)} - Swasthya Sarthi`,
                    emailContent
                );
            }
        } catch (emailError) {
            console.error("Failed to send approval email:", emailError);
        }

        await pharmacy.save();

        const updatedPharmacy = await Pharmacy.findById(pharmacyId)
            .populate('owner', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: `Pharmacy ${approvalStatus} successfully`,
            pharmacy: updatedPharmacy
        });

    } catch (error) {
        console.error("Update pharmacy approval error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating pharmacy approval",
            error: error.message
        });
    }
};

// Get pending volunteer approvals
exports.getPendingVolunteers = async (req, res) => {
    try {
        const pendingVolunteers = await Volunteer.find({ approvalStatus: 'pending' })
            .populate('user', 'firstName lastName email contactNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalPending: pendingVolunteers.length,
            volunteers: pendingVolunteers
        });
    } catch (error) {
        console.error("Get pending volunteers error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching pending volunteers",
            error: error.message
        });
    }
};

// Approve/Reject volunteer
exports.updateVolunteerApproval = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const { approvalStatus, rejectionReason } = req.body;
        const adminId = req.user.id;

        if (approvalStatus === 'rejected' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required when rejecting"
            });
        }

        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer not found"
            });
        }

        volunteer.approvalStatus = approvalStatus;
        volunteer.approvedBy = adminId;
        volunteer.approvedAt = new Date();
        
        if (approvalStatus === 'rejected') {
            volunteer.rejectionReason = rejectionReason;
        }

        await volunteer.save();

        // Send volunteer approval email
        try {
            const user = await User.findById(volunteer.user);
            
            if (user) {
                const emailContent = mailTemplates.adminApprovalEmail(
                    user.firstName,
                    'Volunteer',
                    approvalStatus,
                    rejectionReason
                );
                
                await mailSender(
                    user.email,
                    `Volunteer Application ${approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)} - Swasthya Sarthi`,
                    emailContent
                );
            }
        } catch (emailError) {
            console.error("Failed to send approval email:", emailError);
        }

        const updatedVolunteer = await Volunteer.findById(volunteerId)
            .populate('user', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName');

        res.status(200).json({
            success: true,
            message: `Volunteer ${approvalStatus} successfully`,
            volunteer: updatedVolunteer
        });

    } catch (error) {
        console.error("Update volunteer approval error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating volunteer approval",
            error: error.message
        });
    }
};

// Admin Dashboard - Get overview stats
exports.getAdminDashboard = async (req, res) => {
    try {
        // Get counts
        const totalUsers = await User.countDocuments();
        const totalPharmacies = await Pharmacy.countDocuments();
        const totalVolunteers = await Volunteer.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Pending approvals
        const pendingPharmacies = await Pharmacy.countDocuments({ approvalStatus: 'pending' });
        const pendingVolunteers = await Volunteer.countDocuments({ approvalStatus: 'pending' });

        // Recent orders
        const recentOrders = await Order.find()
            .populate('customer', 'firstName lastName')
            .populate('pharmacy', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            dashboard: {
                totalUsers,
                totalPharmacies,
                totalVolunteers,
                totalOrders,
                pendingApprovals: {
                    pharmacies: pendingPharmacies,
                    volunteers: pendingVolunteers
                },
                recentOrders
            }
        });

    } catch (error) {
        console.error("Get admin dashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching admin dashboard",
            error: error.message
        });
    }
};

// Get all pharmacies with filter
exports.getAllPharmacies = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        
        if (status) {
            filter.approvalStatus = status;
        }

        const pharmacies = await Pharmacy.find(filter)
            .populate('owner', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalPharmacies: pharmacies.length,
            pharmacies
        });

    } catch (error) {
        console.error("Get all pharmacies error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching pharmacies",
            error: error.message
        });
    }
};

// Get all volunteers with filter
exports.getAllVolunteers = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        
        if (status) {
            filter.approvalStatus = status;
        }

        const volunteers = await Volunteer.find(filter)
            .populate('user', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalVolunteers: volunteers.length,
            volunteers
        });

    } catch (error) {
        console.error("Get all volunteers error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching volunteers",
            error: error.message
        });
    }
};