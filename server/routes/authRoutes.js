const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const portalAuth = require('../portal/controllers/authController');
const { authMiddleware: portalProtect } = require('../portal/middleware/auth');

router.post('/login', login);
router.post('/register', protect, register);
router.get('/me', getMe);

// Portal Auth Endpoints
router.post('/forgot-password', portalAuth.forgotPassword);
router.post('/verify-otp', portalAuth.verifyOTP);
router.post('/reset-password', portalAuth.resetPassword);
router.put('/change-password', portalProtect, portalAuth.changePassword);
router.post('/send-otp', portalAuth.sendRegistrationOTP);

module.exports = router;
