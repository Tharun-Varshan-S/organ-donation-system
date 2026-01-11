const express = require('express');
const {
  hospitalRegister,
  hospitalLogin,
  getHospitalProfile,
  updateHospitalProfile
} = require('../controllers/hospitalController');
const { protectHospital, hospitalOnly } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/hospital/register
router.post('/register', hospitalRegister);

// @route   POST /api/hospital/login
router.post('/login', hospitalLogin);

// @route   GET /api/hospital/profile
router.get('/profile', protectHospital, hospitalOnly, getHospitalProfile);

// @route   PUT /api/hospital/profile
router.put('/profile', protectHospital, hospitalOnly, updateHospitalProfile);

module.exports = router;
