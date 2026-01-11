import express from 'express';
import {
  hospitalRegister,
  hospitalLogin,
  getHospitalProfile,
  updateHospitalProfile
} from '../controllers/hospitalController.js';
import { protectHospital, hospitalOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/hospital/register
router.post('/register', hospitalRegister);

// @route   POST /api/hospital/login
router.post('/login', hospitalLogin);

// @route   GET /api/hospital/profile
router.get('/profile', protectHospital, hospitalOnly, getHospitalProfile);

// @route   PUT /api/hospital/profile
router.put('/profile', protectHospital, hospitalOnly, updateHospitalProfile);

export default router;
