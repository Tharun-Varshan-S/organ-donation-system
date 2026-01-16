const express = require('express');
const {
    hospitalRegister,
    hospitalLogin,
    getPublicHospitals,
    getPublicHospitalById
} = require('../controllers/authController');

const router = express.Router();

// Public Routes
router.get('/', getPublicHospitals);
router.get('/:id', getPublicHospitalById);

// Auth Routes
router.post('/register', hospitalRegister);
router.post('/login', hospitalLogin);

module.exports = router;
