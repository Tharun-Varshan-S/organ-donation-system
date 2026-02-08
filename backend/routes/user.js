import express from 'express';
import {
    userRegister,
    userLogin,
    getUserProfile,
    updateUserProfile,
    getUserHistory,
    provideConsent,
    getDonorConfidentialRequests,
    respondToConfidentialRequest,
    updateConfidentialData,
    getConfidentialData,
    getPendingMatchRequests,
    getRecipientSummary
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validateRequest from '../middleware/validateRequest.js';
import { userSchemas } from '../utils/validationSchemas.js';

const router = express.Router();

router.post('/register', validateRequest(userSchemas.register), userRegister);
router.post('/login', validateRequest(userSchemas.login), userLogin);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validateRequest(userSchemas.updateProfile), updateUserProfile);
router.get('/history', protect, getUserHistory);
router.get('/pending-matches', protect, getPendingMatchRequests);
router.put('/consent/:requestId', protect, provideConsent);

// Confidential data routes
router.get('/:id/confidential-requests', protect, getDonorConfidentialRequests);
router.put('/confidential-requests/:requestId/respond', protect, respondToConfidentialRequest);
router.put('/confidential-data', protect, updateConfidentialData);
router.get('/confidential-data', protect, getConfidentialData);
router.get('/recipient-summary', protect, getRecipientSummary);

export default router;

