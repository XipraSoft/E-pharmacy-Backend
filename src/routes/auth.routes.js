const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and social auth
 */

// --- Email/Password Authentication ---

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Test User" }
 *               email: { type: string, example: "test@example.com" }
 *               phone: { type: string, example: "03001234567" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       201:
 *         description: User registered. OTP sent for verification.
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "test@example.com" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       200:
 *         description: Login successful.
 */
router.post('/login', authController.login);


// --- OTP & Password Reset ---

/**
 * @swagger
 * /api/auth/handle-otp:
 *   post:
 *     summary: Verify or Resend OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *               type: { type: string, enum: [registration, password_reset] }
 *     responses:
 *       200:
 *         description: Success.
 */
router.post('/handle-otp', authController.handleOtp);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: "test@example.com" }
 *     responses:
 *       200:
 *         description: OTP sent.
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Set a new password using a reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken: { type: string }
 *               password: { type: string, example: "newPassword123" }
 *     responses:
 *       200:
 *         description: Password reset successfully.
 */
router.post('/reset-password', authController.resetPassword);


// --- Social Logins ---

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Log in with Google
 *     tags: [Authentication]
 *     description: This will redirect to Google's login page.
 *     responses:
 *       302:
 *         description: Redirecting to Google.
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.socialLoginSuccess);

/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     summary: Log in with Facebook
 *     tags: [Authentication]
 *     description: This will redirect to Facebook's login page.
 *     responses:
 *       302:
 *         description: Redirecting to Facebook.
 */
router.get('/facebook', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), authController.socialLoginSuccess);


module.exports = router;