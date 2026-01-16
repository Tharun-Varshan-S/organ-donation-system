import express from 'express';
import {
  getDashboardStats,
  getHospitals,
  getHospitalStats,
  getHospitalDetails,
  approveHospital,
  rejectHospital,
  suspendHospital,
  updateHospitalStatus,
  getDonors,
  getDonorAnalytics,
  getRequests,
  getTransplants,
  getHospitalPerformance,
  getAuditLogs
} from '../controllers/adminController.js';

import { protect, adminOnly } from '../middleware/auth.js';

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
router.put('/hospitals/:id/suspend', suspendHospital);
router.put('/hospitals/:id/reject', rejectHospital);
router.put('/hospitals/:id/status', updateHospitalStatus);

// Analytics routes
router.get('/analytics/donors', getDonorAnalytics);
router.get('/analytics/hospital-performance', getHospitalPerformance);

// Audit logs
router.get('/audit', getAuditLogs);


// Donor routes (read-only)
router.get('/donors', getDonors);

// Request routes (read-only)
router.get('/requests', getRequests);

// Transplant routes (read-only)
router.get('/transplants', getTransplants);

export default router;