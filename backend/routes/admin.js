const express = require('express');
const {
  getDashboardStats,
  getHospitals,
  getHospitalStats,
  approveHospital,
  rejectHospital,

  updateHospitalStatus,
  getDonors,
  getRequests,
  getTransplants
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Apply middleware to all routes
router.use(protect, adminOnly);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// Hospital management routes
router.get('/hospitals', getHospitals);
router.get('/hospitals/stats', getHospitalStats);
router.put('/hospitals/:id/approve', approveHospital);
router.put('/hospitals/:id/reject', rejectHospital);
router.put('/hospitals/:id/status', updateHospitalStatus);

// Donor routes (read-only)
router.get('/donors', getDonors);

// Request routes (read-only)
router.get('/requests', getRequests);

// Transplant routes (read-only)
router.get('/transplants', getTransplants);

module.exports = router;