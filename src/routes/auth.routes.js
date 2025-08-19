const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: 1. Authentication
 *   description: User registration, login, verification, aur password management. Yeh APIs public hain.
 */

/**
 * /**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Ek naya user (customer) register karna (OTP Verification zaroori hogi)
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User ka poora naam.
 *                 example: Ali Khan
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User ka unique email address.
 *                 example: ali.khan@example.com
 *               phone:
 *                 type: string
 *                 description: User ka phone number.
 *                 example: "03001234567"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password kam se kam 8 huroof ka hona chahiye.
 *                 example: mypassword123
 *     responses:
 *       201:
 *         description: Registration kamyab. Verification OTP email par bhej diya gaya hai.
 *       400:
 *         description: Request mein data ghalat ya kam hai.
 *       409:
 *         description: Email pehle se istemal ho chuka hai.
 */
router.post('/register', authController.register);
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Registration ke baad email ko OTP se verify karna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email kamyabi se verify ho gaya. Ab user login kar sakta hai.
 *       400:
 *         description: Diya hua OTP ghalat hai.
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Verification ke liye naya OTP email par bhejna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *     responses:
 *       200:
 *         description: Naya OTP kamyabi se bhej diya gaya.
 *       400:
 *         description: Account pehle se hi verified hai.
 *       404:
 *         description: Is email ke saath koi user nahi mila.
 */
router.post('/resend-otp', authController.resendOtp);

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
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Kamyab login, accessToken wapas milega.
 *       401:
 *         description: Password ghalat hai.
 *       403:
 *         description: Account verified nahi hai.
 *       404:
 *         description: User nahi mila.
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Password bhoolne par reset ke liye OTP bhejna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *     responses:
 *       200:
 *         description: OTP kamyabi se bhej diya gaya.
 *       404:
 *         description: User nahi mila.
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: OTP verify karke naya password set karna
 *     tags: [1. Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: testuser@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: myNewSecurePassword
 *     responses:
 *       200:
 *         description: Password kamyabi se reset ho gaya.
 *       400:
 *         description: OTP ghalat ya expire ho chuka hai.
 */
router.post('/reset-password', authController.resetPassword);


module.exports = router;