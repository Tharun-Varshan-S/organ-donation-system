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
  updateTransplantStatus
} from '../controllers/hospitalController.js';
import {
  hospitalRegister,
  hospitalLogin
} from '../controllers/authController.js';
import { protectHospital, hospitalOnly, ensureApproved } from '../middleware/auth.js';

const router = express.Router();

// Public Routes
router.get('/', getPublicHospitals);
router.get('/:id', getPublicHospitalById);

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

// @route   GET / POST / PUT /api/hospital/donors
router.route('/donors')
  .get(protectHospital, hospitalOnly, ensureApproved, getHospitalDonors)
  .post(protectHospital, hospitalOnly, ensureApproved, createHospitalDonor);

router.put('/donors/:id', protectHospital, hospitalOnly, ensureApproved, updateHospitalDonor);

// @route   GET / POST /api/hospital/requests
router.route('/requests')
  .get(protectHospital, hospitalOnly, ensureApproved, getHospitalRequests)
  .post(protectHospital, hospitalOnly, ensureApproved, createHospitalRequest);

// @route   GET / PUT /api/hospital/transplants
router.get('/transplants', protectHospital, hospitalOnly, ensureApproved, getHospitalTransplants);
router.put('/transplants/:id', protectHospital, hospitalOnly, ensureApproved, updateTransplantStatus);

export default router;
