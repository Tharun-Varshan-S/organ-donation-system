import express from 'express';
import {
  getHospitalProfile,
  updateHospitalProfile,
  getPublicHospitals,
  getPublicHospitalById,
  getDashboardStats,
  getHospitalDonors,
  createHospitalDonor,
  updateHospitalDonor,
  getHospitalRequests,
  createHospitalRequest,
  getHospitalTransplants,
  updateTransplantStatus,
  getNotifications,
  markNotificationRead,
  captureSLABreach,
  getDonorTimeline,
  updateTransplantOutcome,
  getHospitalAnalytics,
  getPublicDonors,
  validateEligibility,
  getDonorProfile,
  getDoctors,
  addDoctor,
  updateDoctor,
  removeDoctor
} from '../controllers/hospitalController.js';
import {
  hospitalRegister,
  hospitalLogin
} from '../controllers/authController.js';
import { protectHospital, hospitalOnly, ensureApproved } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.get('/', getPublicHospitals);
// @route   POST /api/hospital/register
router.post('/register', hospitalRegister);

// @route   POST /api/hospital/login
router.post('/login', hospitalLogin);

// Protected & Approved Routes Middleware Wrapper (Optional, but defining individually is clearer)

// @route   GET /api/hospital/profile
// Note: Profile might remain accessible for pending hospitals if needed, but for now restricting to approved.
// If pending view needs profile, remove ensureApproved.
router.get('/profile', protectHospital, hospitalOnly, getHospitalProfile);

// @route   PUT /api/hospital/profile
router.put('/profile', protectHospital, hospitalOnly, ensureApproved, updateHospitalProfile);

// @route   GET /api/hospital/dashboard
router.get('/dashboard', protectHospital, hospitalOnly, ensureApproved, getDashboardStats);
router.get('/notifications', protectHospital, hospitalOnly, ensureApproved, getNotifications);
router.put('/notifications/:id/read', protectHospital, hospitalOnly, ensureApproved, markNotificationRead);

// @route   GET / POST / PUT /api/hospital/donors
router.route('/donors')
  .get(protectHospital, hospitalOnly, ensureApproved, getHospitalDonors)
  .post(protectHospital, hospitalOnly, ensureApproved, createHospitalDonor);

router.get('/donors/discovery', protectHospital, hospitalOnly, ensureApproved, getPublicDonors);
router.get('/donors/:id/profile', protectHospital, hospitalOnly, ensureApproved, getDonorProfile);

router.post('/donors/:id/request-confidential-data', protectHospital, hospitalOnly, ensureApproved, requestConfidentialData);
router.get('/donors/:id/confidential-data', protectHospital, hospitalOnly, ensureApproved, getConfidentialDonorData);

router.put('/donors/:id', protectHospital, hospitalOnly, ensureApproved, updateHospitalDonor);

// @route   GET / POST /api/hospital/requests
router.route('/requests')
  .get(protectHospital, hospitalOnly, ensureApproved, getHospitalRequests)
  .post(protectHospital, hospitalOnly, ensureApproved, createHospitalRequest);

// @route   GET / PUT /api/hospital/transplants
router.get('/transplants', protectHospital, hospitalOnly, ensureApproved, getHospitalTransplants);
router.put('/transplants/:id', protectHospital, hospitalOnly, ensureApproved, updateTransplantStatus);
router.put('/transplants/:id/outcome', protectHospital, hospitalOnly, ensureApproved, updateTransplantOutcome);

// @route   PUT /api/hospital/requests/:id/sla-breach
router.put('/requests/:id/sla-breach', protectHospital, hospitalOnly, ensureApproved, captureSLABreach);
router.put('/requests/:id/validate-eligibility', protectHospital, hospitalOnly, ensureApproved, validateEligibility);

// @route   GET /api/hospital/donors/:id/timeline
router.get('/donors/:id/timeline', protectHospital, hospitalOnly, ensureApproved, getDonorTimeline);

// @route   GET / POST / PUT / DELETE /api/hospital/doctors
router.route('/doctors')
  .get(protectHospital, hospitalOnly, ensureApproved, getDoctors)
  .post(protectHospital, hospitalOnly, ensureApproved, addDoctor);

router.route('/doctors/:id')
  .put(protectHospital, hospitalOnly, ensureApproved, updateDoctor)
  .delete(protectHospital, hospitalOnly, ensureApproved, removeDoctor);

// @route   GET /api/hospital/analytics
router.get('/analytics', protectHospital, hospitalOnly, ensureApproved, getHospitalAnalytics);

// @route   GET /api/hospital/:id
// @desc    Get public hospital details by ID (Must be last route to match)
router.get('/:id', getPublicHospitalById);

export default router;
