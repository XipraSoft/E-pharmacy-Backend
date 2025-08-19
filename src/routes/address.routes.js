const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: 2. User Management
 */

router.use(verifyToken); // Is file ke saare routes protected hain

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Logged-in user ke liye naya address add karna
 *     tags: [2. User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, city, state, zip_code, country]
 *             properties:
 *               street: { type: string, example: "House 123, Block C" }
 *               city: { type: string, example: "Lahore" }
 *               state: { type: string, example: "Punjab" }
 *               zip_code: { type: string, example: "54000" }
 *               country: { type: string, example: "Pakistan" }
 *     responses:
 *       201:
 *         description: Address kamyabi se add ho gaya.
 */
router.post('/', addressController.addAddress);

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Logged-in user ke saare saved addresses hasil karna
 *     tags: [2. User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User ke addresses ka array.
 */
router.get('/', addressController.getAddresses);

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Ek specific address ko delete karna
 *     tags: [2. User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ki ID
 *     responses:
 *       200:
 *         description: Address kamyabi se delete ho gaya.
 *       404:
 *         description: Address nahi mila.
 */
router.delete('/:id', addressController.deleteAddress);

module.exports = router;