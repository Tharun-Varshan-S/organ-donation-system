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
  getAuditLogs,
  getSystemReports,
  getSettings,
  updateSettings
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

// Donor & Analytics routes
router.get('/donors', getDonors);
router.get('/donors/analytics', getDonorAnalytics);
router.get('/analytics/hospital-performance', getHospitalPerformance);

// Request & Transplant routes (read-only)
router.get('/requests', getRequests);
router.get('/transplants', getTransplants);

// Audit & Reports
router.get('/audit', getAuditLogs);
router.get('/reports', getSystemReports);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;

