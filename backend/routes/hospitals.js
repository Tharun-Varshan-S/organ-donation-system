import express from 'express';
import {
    hospitalRegister,
    hospitalLogin,
    getPublicHospitals,
    getPublicHospitalById
} from '../controllers/authController.js';

const router = express.Router();

// Public Routes
router.get('/', getPublicHospitals);
router.get('/:id', getPublicHospitalById);

// Auth Routes
router.post('/register', hospitalRegister);
router.post('/login', hospitalLogin);

export default router;
