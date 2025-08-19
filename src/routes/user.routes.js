const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: 2. User Management
 *   description: Logged-in user ke liye profile aur address management. (Authorization Token Zaroori Hai)
 */

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Logged-in user ki profile hasil karna
 *     tags: [2. User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User ki profile ki maloomat.
 *       401:
 *         description: Unauthorized (Token ghalat hai).
 *       403:
 *         description: Forbidden (Token nahi diya gaya).
 */
router.get('/profile', [verifyToken], userController.getProfile);

/**
 * @swagger
 * /api/user/profile:
 *   patch:
 *     summary: Logged-in user ki profile update karna
 *     tags: [2. User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ali Khan Updated
 *               phone:
 *                 type: string
 *                 example: "03111234567"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of Birth (YYYY-MM-DD format).
 *                 example: "1995-08-15"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 description: User ka gender.
 *                 example: "Male"
 *     responses:
 *       200:
 *         description: Profile kamyabi se update ho gayi.
 *       401:
 *         description: Unauthorized.
 */
router.patch('/profile', [verifyToken], userController.updateProfile);

module.exports = router;