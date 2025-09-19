const Pharmacy = require("../models/pharmacy");
const Vendor = require("../models/vendor");

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
        const { 
            name, 
            address, 
            longitude, 
            latitude, 
            licenseNumber, 
            gstNumber, 
            contactNumber 
        } = req.body;
        const vendorId = req.user.id;

        // Validation
        if (!name || !address || !longitude || !latitude || !licenseNumber || !contactNumber) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Create pharmacy with pending status
        const pharmacy = new Pharmacy({
            name,
            address,
            owner: vendorId,
            coordinates: { latitude, longitude },
            licenseNumber,
            gstNumber,
            contactNumber,
            approvalStatus: 'pending' // Default pending
        });

        await pharmacy.save();

        // Add pharmacy to vendor's pharmacies
        const vendor = await User.findById(vendorId);
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
exports.searchMedicine = async (req, res) => {
    try {
        const { longitude, latitude, medicineName, radius = 3 } = req.body;
        
        if (!medicineName) {
            return res.status(400).json({ success: false, message: "Medicine name required" });
        }

        if (!longitude || !latitude) {
            return res.status(400).json({ 
                success: false, 
                message: "Location coordinates required. Use /pharmacy/location to get coordinates from address." 
            });
        }

        const searchLat = parseFloat(latitude);
        const searchLon = parseFloat(longitude);
        
        if (isNaN(searchLat) || isNaN(searchLon)) {
            return res.status(400).json({ success: false, message: "Invalid coordinates provided" });
        }

        let result = [];
        let searchType = "within_radius";
        
        // First try within specified radius (default 3km)
        const nearbyPharmacies = await Pharmacy.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [searchLon, searchLat] },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            },
            inventory: {
                $elemMatch: { medicineName: { $regex: medicineName, $options: "i" }, stock: { $gt: 0 } }
            }
        }).populate('owner', 'firstName lastName email contactNumber');

        if (nearbyPharmacies.length > 0) {
            // Found within radius
            result = nearbyPharmacies.map(pharmacy => {
                const med = pharmacy.inventory.find(m => 
                    m.medicineName.toLowerCase().includes(medicineName.toLowerCase()) && m.stock > 0
                );
                const distance = calculateDistance(
                    searchLat, searchLon, 
                    pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]
                );
                return {
                    pharmacyId: pharmacy._id,
                    pharmacyName: pharmacy.name,
                    address: pharmacy.address,
                    ownerName: `${pharmacy.owner.firstName} ${pharmacy.owner.lastName}`,
                    ownerContact: pharmacy.owner.contactNumber,
                    medicineName: med.medicineName,
                    price: med.sellingPrice,
                    isAvailable: true, // Don't show exact stock
                    distance: `${distance.toFixed(2)} km`,
                    coordinates: {
                        latitude: pharmacy.location.coordinates[1],
                        longitude: pharmacy.location.coordinates[0]
                    }
                };
            });
            searchType = `within_${radius}km`;
        } else {
            // Not found within radius, find nearest pharmacies with medicine
            const allPharmacies = await Pharmacy.find({
                inventory: {
                    $elemMatch: { 
                        medicineName: { $regex: medicineName, $options: "i" }, 
                        stock: { $gt: 0 } 
                    }
                }
            }).populate('owner', 'firstName lastName email contactNumber');

            // Calculate distances and sort by nearest
            const pharmaciesWithDistance = allPharmacies.map(pharmacy => {
                const med = pharmacy.inventory.find(m => 
                    m.medicineName.toLowerCase().includes(medicineName.toLowerCase()) && m.stock > 0
                );
                const distance = calculateDistance(
                    searchLat, searchLon, 
                    pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]
                );
                return {
                    pharmacyId: pharmacy._id,
                    pharmacyName: pharmacy.name,
                    address: pharmacy.address,
                    ownerName: `${pharmacy.owner.firstName} ${pharmacy.owner.lastName}`,
                    ownerContact: pharmacy.owner.contactNumber,
                    medicineName: med.medicineName,
                    price: med.sellingPrice,
                    isAvailable: true,
                    distance: `${distance.toFixed(2)} km`,
                    distanceValue: distance,
                    coordinates: {
                        latitude: pharmacy.location.coordinates[1],
                        longitude: pharmacy.location.coordinates[0]
                    }
                };
            }).sort((a, b) => a.distanceValue - b.distanceValue);

            result = pharmaciesWithDistance.slice(0, 10); // Top 10 nearest
            searchType = "nearest_available";
        }

        // Remove distanceValue from final result
        result = result.map(({distanceValue, ...pharmacy}) => pharmacy);

        res.status(200).json({ 
            success: true, 
            searchType,
            searchLocation: { latitude: searchLat, longitude: searchLon },
            totalResults: result.length,
            message: result.length > 0 ? 
                (searchType.includes('within') ? `Found ${result.length} pharmacy(ies) within ${radius}km` :
                 searchType === 'nearest_available' ? `Medicine not found within ${radius}km. Showing nearest available pharmacies.` :
                 `Found ${result.length} pharmacy(ies)`) :
                "No pharmacies found with this medicine",
            pharmacies: result 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error searching medicine", error: error.message });
    }
};