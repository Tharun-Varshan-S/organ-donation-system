const express = require('express');
const {
  getDashboardStats,
  getHospitals,
  getHospitalStats,
  getHospitalDetails,
  approveHospital,
  rejectHospital,
  getAuditLogs,
  getHospitalPerformance,
  getDonorAnalytics,


  updateHospitalStatus,
  getDonors,
  getRequests,
  getTransplants,
  getSystemReports
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
router.get('/hospitals/:id', getHospitalDetails);
router.put('/hospitals/:id/approve', approveHospital);
router.put('/hospitals/:id/reject', rejectHospital);
router.put('/hospitals/:id/status', updateHospitalStatus);

// Donor routes (read-only)
router.get('/donors', getDonors);
router.get('/analytics/donors', getDonorAnalytics);
router.get('/analytics/hospital-performance', getHospitalPerformance);

// Request routes (read-only)
router.get('/requests', getRequests);

// Transplant routes (read-only)
router.get('/transplants', getTransplants);

// Audit Logs
router.get('/audit', getAuditLogs);

// System Reports
router.get('/reports/system', getSystemReports);

module.exports = router;