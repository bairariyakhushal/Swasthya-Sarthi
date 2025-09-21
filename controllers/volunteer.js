const Volunteer = require('../models/volunteer');
const Order = require('../models/order');
const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

// Helper function to calculate delivery charges
function calculateDeliveryCharges(distance) {
    // Delivery charge structure
    if (distance <= 2) return 20;        // ≤2km: ₹20
    if (distance <= 5) return 30;        // 2-5km: ₹30
    if (distance <= 10) return 50;       // 5-10km: ₹50
    if (distance <= 15) return 70;       // 10-15km: ₹70
    return Math.ceil(distance * 5);      // >15km: ₹5/km
}

// Get available orders for volunteer  
exports.getAvailableOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user is approved volunteer
        const volunteer = await Volunteer.findOne({
            user: userId,
            approvalStatus: 'approved',
            isAvailable: true
        });

        if (!volunteer) {
            return res.status(403).json({
                success: false,
                message: "You are not an approved and available volunteer"
            });
        }

        // Get orders that need delivery
        const availableOrders = await Order.find({
            orderStatus: 'confirmed',
            volunteer: { $exists: false },
            paymentStatus: 'completed'
        })
            .populate('customer', 'firstName lastName contactNumber')
            .populate('pharmacy', 'name address coordinates')
            .sort({ createdAt: 1 });

        console.log(`Found ${availableOrders.length} available orders`);

        // Process orders
        const ordersWithDetails = availableOrders
            .filter(order => {
                // Check coordinates exist
                const hasDeliveryCoords = order.deliveryCoordinates && order.deliveryCoordinates.latitude;
                const hasPharmacyCoords = order.pharmacy.coordinates && order.pharmacy.coordinates.latitude;
                return hasDeliveryCoords && hasPharmacyCoords;
            })
            .map(order => {
                // Calculate distance
                const distance = calculateDistance(
                    order.pharmacy.coordinates.latitude, order.pharmacy.coordinates.longitude,
                    order.deliveryCoordinates.latitude, order.deliveryCoordinates.longitude
                );

                // Add debug log
                console.log(`Order ${order._id}:`);
                console.log(`  Pharmacy: lat=${order.pharmacy.coordinates.latitude}, lon=${order.pharmacy.coordinates.longitude}`);
                console.log(`  Delivery: lat=${order.deliveryCoordinates.latitude}, lon=${order.deliveryCoordinates.longitude}`);
                console.log(`  Distance: ${distance.toFixed(2)}km`);
                console.log(`  Service Radius: ${volunteer.serviceArea.radius}km`);
                console.log(`  Within Range: ${distance <= volunteer.serviceArea.radius}`);



                // Calculate delivery charges
                const deliveryCharges = calculateDeliveryCharges(distance);

                return {
                    orderId: order._id,
                    customer: order.customer,
                    pharmacy: {
                        name: order.pharmacy.name,
                        address: order.pharmacy.address,
                        coordinates: order.pharmacy.coordinates
                    },
                    medicines: order.medicines,
                    deliveryAddress: order.deliveryAddress,
                    deliveryCoordinates: order.deliveryCoordinates,
                    contactNumber: order.contactNumber,
                    medicineTotal: order.medicineTotal,
                    distance: parseFloat(distance.toFixed(2)),
                    deliveryCharges: deliveryCharges,
                    totalAmount: order.medicineTotal + deliveryCharges,
                    orderPlacedAt: order.orderPlacedAt
                };
            })
            .filter(order => order.distance <= volunteer.serviceArea.radius);

        console.log(`Returning ${ordersWithDetails.length} orders within service area`);

        res.status(200).json({
            success: true,
            totalOrders: ordersWithDetails.length,
            orders: ordersWithDetails
        });

    } catch (error) {
        console.error("Get available orders error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching available orders",
            error: error.message
        });
    }
};

// Accept delivery order
exports.acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const volunteer = await Volunteer.findOne({
            user: userId,
            approvalStatus: 'approved'
        });

        if (!volunteer) {
            return res.status(403).json({
                success: false,
                message: "You are not an approved volunteer"
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== 'confirmed') {
            return res.status(400).json({
                success: false,
                message: "Order is not available for assignment"
            });
        }

        if (order.volunteer) {
            return res.status(400).json({
                success: false,
                message: "Order already assigned to another volunteer"
            });
        }

        // Calculate and update delivery charges
        const pharmacy = await Pharmacy.findById(order.pharmacy);
        const distance = calculateDistance(
            pharmacy.coordinates.latitude, pharmacy.coordinates.longitude,
            order.deliveryCoordinates.latitude, order.deliveryCoordinates.longitude
        );

        const deliveryCharges = calculateDeliveryCharges(distance);

        // Update order
        order.volunteer = userId;
        order.orderStatus = 'assigned';
        order.assignedAt = new Date();
        order.deliveryDistance = distance;
        order.deliveryCharges = deliveryCharges;
        order.totalAmount = order.medicineTotal + deliveryCharges;

        await order.save();

        // Add to volunteer's active orders
        volunteer.activeOrders.push(orderId);
        volunteer.isAvailable = false; // Mark as busy
        await volunteer.save();

        const updatedOrder = await Order.findById(orderId)
            .populate('customer', 'firstName lastName')
            .populate('pharmacy', 'name address');

        res.status(200).json({
            success: true,
            message: "Order accepted successfully",
            order: updatedOrder,
            deliveryDetails: {
                distance: distance.toFixed(2) + " km",
                deliveryCharges: deliveryCharges,
                totalAmount: order.totalAmount
            }
        });

    } catch (error) {
        console.error("Accept order error:", error);
        res.status(500).json({
            success: false,
            message: "Error accepting order",
            error: error.message
        });
    }
};

// Mark pickup complete
exports.markPickupComplete = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({
            _id: orderId,
            volunteer: userId,
            orderStatus: 'assigned'
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not assigned to you"
            });
        }

        order.orderStatus = 'picked_up';
        order.pickedUpAt = new Date();
        await order.save();

        res.status(200).json({
            success: true,
            message: "Pickup marked as complete",
            order
        });

    } catch (error) {
        console.error("Mark pickup complete error:", error);
        res.status(500).json({
            success: false,
            message: "Error marking pickup complete",
            error: error.message
        });
    }
};

// Mark out for delivery
exports.markOutForDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({
            _id: orderId,
            volunteer: userId,
            orderStatus: 'picked_up'
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not picked up yet"
            });
        }

        order.orderStatus = 'out_for_delivery';
        order.outForDeliveryAt = new Date();
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order marked as out for delivery",
            order
        });

    } catch (error) {
        console.error("Mark out for delivery error:", error);
        res.status(500).json({
            success: false,
            message: "Error marking out for delivery",
            error: error.message
        });
    }
};

// Mark delivery complete
exports.markDeliveryComplete = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({
            _id: orderId,
            volunteer: userId,
            orderStatus: 'out_for_delivery'
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or not out for delivery"
            });
        }

        order.orderStatus = 'delivered';
        order.deliveredAt = new Date();
        await order.save();

        // Update volunteer status
        const volunteer = await Volunteer.findOne({ user: userId });
        volunteer.activeOrders = volunteer.activeOrders.filter(
            id => id.toString() !== orderId
        );
        volunteer.totalDeliveries += 1;
        volunteer.isAvailable = true; // Mark as available again
        await volunteer.save();

        res.status(200).json({
            success: true,
            message: "Delivery marked as complete",
            order,
            deliveryCharges: order.deliveryCharges
        });

    } catch (error) {
        console.error("Mark delivery complete error:", error);
        res.status(500).json({
            success: false,
            message: "Error marking delivery complete",
            error: error.message
        });
    }
};

// Get volunteer's deliveries
exports.getMyDeliveries = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let filter = { volunteer: userId };
        if (status) {
            filter.orderStatus = status;
        }

        const deliveries = await Order.find(filter)
            .populate('customer', 'firstName lastName')
            .populate('pharmacy', 'name address')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalDeliveries: deliveries.length,
            deliveries
        });

    } catch (error) {
        console.error("Get my deliveries error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching deliveries",
            error: error.message
        });
    }
};

// Update volunteer location
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude required"
            });
        }

        const volunteer = await Volunteer.findOneAndUpdate(
            { user: userId },
            {
                currentLocation: { latitude, longitude },
                lastLocationUpdate: new Date()
            },
            { new: true }
        );

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Location updated successfully",
            location: volunteer.currentLocation
        });

    } catch (error) {
        console.error("Update location error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating location",
            error: error.message
        });
    }
};

// Toggle volunteer availability
exports.toggleAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const { isAvailable } = req.body;

        // Find volunteer
        const volunteer = await Volunteer.findOne({ user: userId });
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer profile not found"
            });
        }

        // Check if volunteer is approved
        if (volunteer.approvalStatus !== 'approved') {
            return res.status(403).json({
                success: false,
                message: "Only approved volunteers can change availability"
            });
        }

        // Check if volunteer has active orders
        if (!isAvailable && volunteer.activeOrders.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot go offline while having active deliveries",
                activeOrdersCount: volunteer.activeOrders.length
            });
        }

        // Update availability
        volunteer.isAvailable = isAvailable;
        await volunteer.save();

        res.status(200).json({
            success: true,
            message: `Volunteer status changed to ${isAvailable ? 'Available' : 'Offline'}`,
            volunteer: {
                id: volunteer._id,
                isAvailable: volunteer.isAvailable,
                activeOrders: volunteer.activeOrders.length,
            }
        });

    } catch (error) {
        console.error("Toggle availability error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating availability status",
            error: error.message
        });
    }
};

// Get volunteer profile/status
exports.getVolunteerProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const volunteer = await Volunteer.findOne({ user: userId })
            .populate('user', 'firstName lastName email contactNumber')
            .populate('activeOrders', 'orderStatus deliveryAddress');

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: "Volunteer profile not found"
            });
        }

        res.status(200).json({
            success: true,
            volunteer: {
                id: volunteer._id,
                user: volunteer.user,
                vehicleType: volunteer.vehicleType,
                vehicleNumber: volunteer.vehicleNumber,
                serviceArea: volunteer.serviceArea,
                isAvailable: volunteer.isAvailable,
                approvalStatus: volunteer.approvalStatus,
                totalDeliveries: volunteer.totalDeliveries,
                rating: volunteer.rating,
                activeOrders: volunteer.activeOrders,
                currentLocation: volunteer.currentLocation,
                lastLocationUpdate: volunteer.lastLocationUpdate,
            }
        });

    } catch (error) {
        console.error("Get volunteer profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching volunteer profile",
            error: error.message
        });
    }
};