const Pharmacy = require("../models/pharmacy");
const Vendor = require("../models/vendor");
const User = require("../models/user");
const Order = require("../models/order");
const { mailSender } = require("../utils/mailSender");

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
}

// Convert address/city to coordinates (using external geocoding service)
exports.getLocationCoordinates = async (req, res) => {
    try {
        const { address, city, state } = req.query;
        
        if (!address && !city) {
            return res.status(400).json({ success: false, message: "Address or city required" });
        }

        const searchQuery = `${address || ''} ${city || ''} ${state || ''}`.trim();
        
        // Use a geocoding service (Google Maps Geocoding API, OpenCage, etc.)
        // For demo purposes, I'll show how to integrate with OpenCage (free tier available)
        
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchQuery)}&key=${process.env.OPENCAGE_API_KEY}&limit=5`
        );
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const results = data.results.map(result => ({
                displayName: result.formatted,
                latitude: result.geometry.lat,
                longitude: result.geometry.lng,
                city: result.components.city || result.components.town || result.components.village,
                state: result.components.state,
                country: result.components.country
            }));
            
            res.status(200).json({ 
                success: true, 
                locations: results 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: "Location not found" 
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching location", error: error.message });
    }
};

// Vendor registers a new pharmacy
exports.registerPharmacy = async (req, res) => {
    try {
        const { name, address, latitude, longitude, licenseNumber, gstNumber, contactNumber } = req.body;
        const vendorId = req.user.id;

        // Validation
        if (!name || !address || !longitude || !latitude || !licenseNumber || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Check if vendor exists
        const vendor = await User.findById(vendorId);
        if (!vendor || vendor.accountType !== 'Vendor') {
            return res.status(403).json({
                success: false,
                message: "Only vendors can register pharmacies"
            });
        }

        // Create pharmacy
        const pharmacy = new Pharmacy({
            name,
            address,
            owner: vendorId,
            coordinates: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            licenseNumber,
            gstNumber,
            contactNumber,
            approvalStatus: 'pending'
        });

        await pharmacy.save();

        // Initialize pharmacies array if it doesn't exist
        if (!vendor.pharmacies) {
            vendor.pharmacies = [];
        }
        
        vendor.pharmacies.push(pharmacy._id);
        await vendor.save();

        res.status(201).json({
            success: true,
            message: "Pharmacy registered successfully. Waiting for admin approval.",
            pharmacy: pharmacy
        });

    } catch (error) {
        console.error("Register pharmacy error:", error);
        res.status(500).json({
            success: false,
            message: "Error registering pharmacy",
            error: error.message
        });
    }
};

// Update pharmacy inventory (add/update medicine)
exports.updateInventory = async (req, res) => {
    try {
        const { pharmacyId } = req.params;
        const { medicineName, sellingPrice, stock, purchasePrice } = req.body;
        const vendorId = req.user.id;

        if (!medicineName || !sellingPrice || !stock) {
            return res.status(400).json({ success: false, message: "Medicine name, selling price and stock are required" });
        }

        // Check if pharmacy belongs to this vendor
        const pharmacy = await Pharmacy.findOne({ _id: pharmacyId, owner: vendorId });
        if (!pharmacy) {
            return res.status(404).json({ success: false, message: "Pharmacy not found or unauthorized" });
        }

        // Check if medicine already exists in inventory
        const existingMedicineIndex = pharmacy.inventory.findIndex(med => 
            med.medicineName.toLowerCase() === medicineName.toLowerCase()
        );

        if (existingMedicineIndex !== -1) {
            // Update existing medicine
            pharmacy.inventory[existingMedicineIndex].sellingPrice = sellingPrice;
            pharmacy.inventory[existingMedicineIndex].stock = stock;
            if (purchasePrice) pharmacy.inventory[existingMedicineIndex].purchasePrice = purchasePrice;
        } else {
            // Add new medicine
            pharmacy.inventory.push({
                medicineName,
                sellingPrice,
                stock,
                purchasePrice: purchasePrice || 0
            });
        }

        await pharmacy.save();

        res.status(200).json({ 
            success: true, 
            message: "Inventory updated successfully", 
            inventory: pharmacy.inventory 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating inventory", error: error.message });
    }
};

// Enhanced medicine search - handles all search scenarios
// In pharmacy.js controller - Fix searchMedicine function
exports.searchMedicine = async (req, res) => {
    try {
        const { medicineName, latitude, longitude, radius = 3 } = req.body; // Use req.query for GET
        
        if (!medicineName) {
            return res.status(400).json({ 
                success: false, 
                message: "Medicine name is required" 
            });
        }

        let result = [];
        let searchType = "global_search";

        // If location provided, search by proximity
        if (latitude && longitude) {
            const searchLat = parseFloat(latitude);
            const searchLon = parseFloat(longitude);
            
            if (isNaN(searchLat) || isNaN(searchLon)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Valid latitude and longitude required" 
                });
            }

            // Find all pharmacies with the medicine
            const pharmacies = await Pharmacy.find({
                'inventory.medicineName': { $regex: medicineName, $options: "i" },
                'inventory.stock': { $gt: 0 },
                approvalStatus: 'approved' // Only approved pharmacies
            }).populate('owner', 'firstName lastName contactNumber');

            // Calculate distances and filter
            const pharmaciesWithDistance = [];
            
            for (const pharmacy of pharmacies) {
                const medicine = pharmacy.inventory.find(m => 
                    m.medicineName.toLowerCase().includes(medicineName.toLowerCase()) && m.stock > 0
                );

                if (medicine) {
                    const distance = calculateDistance(
                        searchLat, searchLon, 
                        pharmacy.coordinates.latitude, pharmacy.coordinates.longitude
                    );

                    pharmaciesWithDistance.push({
                        pharmacyId: pharmacy._id,
                        pharmacyName: pharmacy.name,
                        address: pharmacy.address,
                        medicineName: medicine.medicineName,
                        price: medicine.sellingPrice,
                        isAvailable: true,
                        distance: `${distance.toFixed(1)} km`,
                        distanceValue: distance,
                        ownerName: `${pharmacy.owner.firstName} ${pharmacy.owner.lastName}`,
                        ownerContact: pharmacy.owner.contactNumber
                    });
                }
            }

            // Sort by distance
            pharmaciesWithDistance.sort((a, b) => a.distanceValue - b.distanceValue);

            // Check if any pharmacy within radius
            const withinRadius = pharmaciesWithDistance.filter(p => p.distanceValue <= radius);
            
            if (withinRadius.length > 0) {
                result = withinRadius;
                searchType = `within_${radius}km`;
            } else {
                // Show nearest 5 pharmacies if none within radius
                result = pharmaciesWithDistance.slice(0, 5);
                searchType = "nearest_available";
            }

            // Remove distanceValue from response
            result = result.map(({distanceValue, ...pharmacy}) => pharmacy);
        } else {
            // Global search without location
            const pharmacies = await Pharmacy.find({
                'inventory.medicineName': { $regex: medicineName, $options: "i" },
                'inventory.stock': { $gt: 0 },
                approvalStatus: 'approved'
            }).populate('owner', 'firstName lastName contactNumber');

            result = pharmacies.map(pharmacy => {
                const medicine = pharmacy.inventory.find(m => 
                    m.medicineName.toLowerCase().includes(medicineName.toLowerCase()) && m.stock > 0
                );

                return {
                    pharmacyId: pharmacy._id,
                    pharmacyName: pharmacy.name,
                    address: pharmacy.address,
                    medicineName: medicine.medicineName,
                    price: medicine.sellingPrice,
                    isAvailable: true,
                    ownerName: `${pharmacy.owner.firstName} ${pharmacy.owner.lastName}`,
                    ownerContact: pharmacy.owner.contactNumber
                };
            });
            
            searchType = "global_search";
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No pharmacy found with ${medicineName}`
            });
        }

        res.status(200).json({ 
            success: true, 
            searchType,
            totalResults: result.length,
            message: result.length > 0 ? 
                (searchType.includes('within') ? `Found ${result.length} pharmacy(ies) within ${radius}km` :
                 searchType === 'nearest_available' ? `Medicine not found within ${radius}km. Showing nearest available pharmacies.` :
                 `Found ${result.length} pharmacy(ies)`) :
                `No pharmacy found with ${medicineName}`,
            pharmacies: result 
        });

    } catch (error) {
        console.error("Search medicine error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error searching medicine", 
            error: error.message 
        });
    }
};

//mark order ready for pickup
exports.markOrderReadyForPickup = async (req, res) => {
    try {
        const { orderId } = req.params;
        const vendorId = req.user.id;

        const order = await Order.findOne({
            _id: orderId,
            vendor: vendorId,
            deliveryType: 'pickup',
            orderStatus: 'confirmed'
        }).populate('customer', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Pickup order not found"
            });
        }

        order.orderStatus = 'ready_for_pickup';
        order.readyForPickupAt = new Date();
        await order.save();

        // Send notification to customer (email/SMS)
        try {
            const emailBody = `
                Your order is ready for pickup!
                
                Pickup Code: ${order.pickupCode}
                Pharmacy: ${order.pharmacy.name}
                Total Amount: ₹${order.totalAmount}
                
                Please visit the pharmacy with this pickup code.
            `;
            
            await mailSender(
                order.customer.email,
                "Order Ready for Pickup",
                emailBody
            );
        } catch (emailError) {
            console.log("Email notification failed:", emailError);
        }

        res.status(200).json({
            success: true,
            message: "Order marked as ready for pickup",
            order: {
                orderId: order._id,
                pickupCode: order.pickupCode,
                orderStatus: order.orderStatus,
                readyForPickupAt: order.readyForPickupAt
            }
        });

    } catch (error) {
        console.error("Mark ready for pickup error:", error);
        res.status(500).json({
            success: false,
            message: "Error marking order ready for pickup",
            error: error.message
        });
    }
};

// Vendor confirms customer pickup
exports.confirmCustomerPickup = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { pickupCode } = req.body;
        const vendorId = req.user.id;

        if (!pickupCode) {
            return res.status(400).json({
                success: false,
                message: "Pickup code is required"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            vendor: vendorId,
            deliveryType: 'pickup',
            orderStatus: 'ready_for_pickup',
            pickupCode: pickupCode.toUpperCase()
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Invalid pickup code or order not ready"
            });
        }

        order.orderStatus = 'completed';
        order.pickedUpByCustomerAt = new Date();
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order pickup confirmed",
            order: {
                orderId: order._id,
                orderStatus: order.orderStatus,
                pickedUpAt: order.pickedUpByCustomerAt,
                totalAmount: order.totalAmount
            }
        });

    } catch (error) {
        console.error("Confirm pickup error:", error);
        res.status(500).json({
            success: false,
            message: "Error confirming pickup",
            error: error.message
        });
    }
};