const express = require("express");
const router = express.Router();
const {
    getPendingPharmacies,
    updatePharmacyApproval,
    getPendingVolunteers,
    updateVolunteerApproval,
    getAdminDashboard,
    getAllPharmacies,
    getAllVolunteers
} = require("../controllers/admin");
const { auth, isAdmin } = require("../middlewares/auth");

// Admin dashboard
router.get("/dashboard", auth, isAdmin, getAdminDashboard);

// Pharmacy management
router.get("/pharmacies/pending", auth, isAdmin, getPendingPharmacies);
router.get("/pharmacies", auth, isAdmin, getAllPharmacies);
router.put("/pharmacies/:pharmacyId/approval", auth, isAdmin, updatePharmacyApproval);

// Volunteer management
router.get("/volunteers/pending", auth, isAdmin, getPendingVolunteers);
router.get("/volunteers", auth, isAdmin, getAllVolunteers);
router.put("/volunteers/:volunteerId/approval", auth, isAdmin, updateVolunteerApproval);

module.exports = router;