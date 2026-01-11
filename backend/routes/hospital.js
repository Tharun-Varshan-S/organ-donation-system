const express = require('express');
const { hospitalAuth } = require('../middleware/auth');
const {
  hospitalRegister,
  hospitalLogin,
  getApprovedHospitals,
  getHospitalDonors,
  addDonor
} = require('../controllers/hospitalController');

const router = express.Router();

// Public routes
router.post('/register', hospitalRegister);
router.post('/login', hospitalLogin);
router.get('/approved', getApprovedHospitals);

// Protected routes
router.use(hospitalAuth);
router.get('/donors', getHospitalDonors);
router.post('/donors', addDonor);

module.exports = router;