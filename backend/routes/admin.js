const express = require('express');
const { adminAuth } = require('../middleware/auth');
const {
  adminLogin,
  getDashboardStats,
  getHospitals,
  approveHospital,
  rejectHospital
} = require('../controllers/adminController');

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.use(adminAuth);
router.get('/dashboard/stats', getDashboardStats);
router.get('/hospitals', getHospitals);
router.put('/hospitals/:id/approve', approveHospital);
router.delete('/hospitals/:id/reject', rejectHospital);

module.exports = router;