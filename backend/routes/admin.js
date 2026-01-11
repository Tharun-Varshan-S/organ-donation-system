import express from 'express';
import {
  getDashboardStats,
  getHospitals,
  approveHospital,
  suspendHospital,
  updateHospitalStatus,
  getDonors,
  getRequests,
  getTransplants
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect, adminOnly);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// Hospital management routes
router.get('/hospitals', getHospitals);
router.put('/hospitals/:id/approve', approveHospital);
router.put('/hospitals/:id/suspend', suspendHospital);
router.put('/hospitals/:id/status', updateHospitalStatus);

// Donor routes (read-only)
router.get('/donors', getDonors);

// Request routes (read-only)
router.get('/requests', getRequests);

// Transplant routes (read-only)
router.get('/transplants', getTransplants);

export default router;