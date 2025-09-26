const Order = require('../models/order');
const Pharmacy = require('../models/pharmacy');

// Get All Vendor's Pharmacies (Simple List)
const getVendorPharmacies = async (req, res) => {
    try {
        const vendorId = req.user.id;
        
        const pharmacies = await Pharmacy.find({ owner: vendorId })
            .select('name address contactNumber approvalStatus');

        if (!pharmacies || pharmacies.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No pharmacies found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                totalPharmacies: pharmacies.length,
                pharmacies
            }
        });

    } catch (error) {
        console.error("Get pharmacies error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching pharmacies"
        });
    }
};

// Get Simple Pharmacy Dashboard
const getPharmacyDashboard = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { pharmacyId } = req.params;
        
        // Check pharmacy belongs to vendor
        const pharmacy = await Pharmacy.findOne({ 
            _id: pharmacyId, 
            owner: vendorId 
        });
        
        if (!pharmacy) {
            return res.status(404).json({
                success: false,
                message: "Pharmacy not found"
            });
        }

        // Get all orders for this pharmacy
        const allOrders = await Order.find({ pharmacy: pharmacyId })
            .populate('customer', 'firstName lastName');

        // Simple calculations
        const totalOrders = allOrders.length;
        const completedOrders = allOrders.filter(order => 
            order.orderStatus === 'delivered' || order.orderStatus === 'completed'
        );
        const pendingOrders = allOrders.filter(order => 
            order.orderStatus === 'pending' || order.orderStatus === 'processing'
        );

        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalMedicinesSold = completedOrders.reduce((sum, order) => 
            sum + order.medicines.reduce((medSum, med) => medSum + med.quantity, 0), 0
        );

        // Assume a flat 25% profit margin for simplicity
        const netProfit = totalRevenue * 0.25;

        res.status(200).json({
            success: true,
            data: {
                pharmacy: {
                    name: pharmacy.name,
                    address: pharmacy.address
                },
                stats: {
                    totalOrders,
                    completedOrders: completedOrders.length,
                    pendingOrders: pendingOrders.length,
                    totalRevenue: Math.round(totalRevenue),
                    netProfit: Math.round(netProfit),
                    totalMedicinesSold
                }
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard"
        });
    }
};

// Get Simple Sales Report
const getPharmacySalesReport = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { pharmacyId } = req.params;

        // Check pharmacy belongs to vendor
        const pharmacy = await Pharmacy.findOne({ 
            _id: pharmacyId, 
            owner: vendorId 
        });
        
        if (!pharmacy) {
            return res.status(404).json({
                success: false,
                message: "Pharmacy not found"
            });
        }

        // Get all orders for this pharmacy
        const orders = await Order.find({ pharmacy: pharmacyId })
            .populate('customer', 'firstName lastName')
            .sort({ createdAt: -1 });

        const orderList = orders.map(order => ({
            orderId: order._id.toString().slice(-8).toUpperCase(),
            customerName: `${order.customer?.firstName} ${order.customer?.lastName}`,
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
            deliveryType: order.deliveryType,
            orderDate: order.createdAt.toDateString(),
            medicineCount: order.medicines.length
        }));

        res.status(200).json({
            success: true,
            data: {
                pharmacy: {
                    name: pharmacy.name
                },
                totalOrders: orders.length,
                orders: orderList
            }
        });

    } catch (error) {
        console.error("Sales report error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching sales report"
        });
    }
};

// Get Top Selling Medicines
const getTopMedicines = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { pharmacyId } = req.params;
        
        // Check pharmacy belongs to vendor
        const pharmacy = await Pharmacy.findOne({ 
            _id: pharmacyId, 
            owner: vendorId 
        });
        
        if (!pharmacy) {
            return res.status(404).json({
                success: false,
                message: "Pharmacy not found"
            });
        }

        // Get completed orders
        const completedOrders = await Order.find({ 
            pharmacy: pharmacyId,
            orderStatus: { $in: ['delivered', 'completed'] }
        });

        // Count medicine sales
        const medicineStats = {};
        
        completedOrders.forEach(order => {
            order.medicines.forEach(medicine => {
                const name = medicine.medicineName;
                if (!medicineStats[name]) {
                    medicineStats[name] = {
                        name,
                        totalQuantity: 0,
                        totalRevenue: 0
                    };
                }
                medicineStats[name].totalQuantity += medicine.quantity;
                medicineStats[name].totalRevenue += medicine.total;
            });
        });

        // Convert to array and sort
        const topMedicines = Object.values(medicineStats)
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10); // Top 10

        res.status(200).json({
            success: true,
            data: {
                pharmacy: {
                    name: pharmacy.name
                },
                topMedicines
            }
        });

    } catch (error) {
        console.error("Top medicines error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching top medicines"
        });
    }
};

module.exports = {
    getVendorPharmacies,
    getPharmacyDashboard,
    getPharmacySalesReport,
    getTopMedicines
};