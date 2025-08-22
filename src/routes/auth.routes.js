const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');
/**
 * @swagger
 * tags:
 *   name: 1. Authentication
 *   description: User registration, login, verification, and password management.
 */

// --- Registration Flow ---
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Step 1 - Ek naya user register karna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: 'object', required: ['name', 'email', 'phone', 'password'], properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, password: { type: 'string' } } }
 *     responses:
 *       201: { description: "Registration successful! An OTP has been sent to your email." }
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Step 2 - Registration ke baad email ko OTP se verify karna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: 'object', required: ['email', 'otp'], properties: { email: { type: 'string' }, otp: { type: 'string' } } }
 *     responses:
 *       200: { description: "Email verified successfully! You can now log in." }
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: (Optional) Verification ke liye naya OTP email par bhejna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } }
 *     responses:
 *       200: { description: "A new OTP has been sent to your email address." }
 */
router.post('/resend-otp', authController.resendOtp);


// --- Login Flow ---
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User ko login karwa kar token hasil karna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } }
 *     responses:
 *       200: { description: "Login successful!" }
 *       403: { description: "Account is not verified." }
 */
router.post('/login', authController.login);


// --- Password Reset Flow ---
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Step 1 - Password bhoolne par reset ke liye OTP bhejna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } }
 *     responses:
 *       200: { description: "An OTP has been sent to your email." }
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/verify-password-otp:
 *   post:
 *     summary: Step 2 - Password reset ke OTP ko verify karna aur ek temporary token hasil karna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: 'object', required: ['email', 'otp'], properties: { email: { type: 'string' }, otp: { type: 'string' } } }
 *     responses:
 *       200: { description: "OTP verified. Use the returned tempToken to set a new password." }
 */
router.post('/verify-password-otp', authController.verifyPasswordResetOtp);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Step 3 - Temporary token ka istemal karke naya password set karna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: 'object', required: ['tempToken', 'password'], properties: { tempToken: { type: 'string' }, password: { type: 'string' } } }
 *     responses:
 *       200: { description: "Password has been reset successfully." }
 */
router.post('/reset-password', authController.resetPassword);



router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
    authController.socialLoginSuccess 
);


router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile','email'] }));
router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    authController.socialLoginSuccess
);

module.exports = router;