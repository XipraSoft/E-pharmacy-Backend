const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');

/**
 * @swagger
 * tags:
 *   name: 4. Admin
 *   description: Sirf Admin ke liye makhsoos operations. (Authorization Token Zaroori Hai)
 */

router.use([verifyToken, isAdmin]); // Is file ke saare routes Admin-only hain

/**
 * @swagger
 * /api/admin/delivery-agents:
 *   post:
 *     summary: Naya delivery agent add karna (Admin Only)
 *     tags: [4. Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name: { type: string, example: "Delivery Guy 1" }
 *               email: { type: string, example: "agent1@example.com" }
 *               phone: { type: string, example: "03331234567" }
 *               password: { type: string, example: "agentpassword" }
 *     responses:
 *       201:
 *         description: Delivery agent kamyabi se add ho gaya.
 */
router.post('/delivery-agents', adminController.createDeliveryAgent);

/**
 * @swagger
 * /api/admin/orders/assign:
 *   patch:
 *     summary: Ek order ko delivery agent ko assign karna (Admin Only)
 *     tags: [4. Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, agentId]
 *             properties:
 *               orderId: { type: integer, example: 1 }
 *               agentId: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: Order kamyabi se assign ho gaya.
 *       404:
 *         description: Order ya Agent nahi mila.
 */
router.patch('/orders/assign', adminController.assignOrderToAgent);

module.exports = router;