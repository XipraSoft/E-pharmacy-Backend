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




/**
 * @swagger
 * tags:
 *   name: 4. Admin
 *   description: Sirf Admin ke liye makhsoos operations. (Authorization Token Zaroori Hai)
 */

router.use([verifyToken, isAdmin]); // Is file ke saare routes Admin-only hain

//

// --- Order Management ---
/**
 * @swagger
 * /api/admin/orders/all:
 *   get:
 *     summary: Saare users ke orders dekhna (Admin Only)
 *     tags: [4. Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, Processing, Packed, Shipped, Delivered, Cancelled] }
 *         description: Order status se filter karein
 *     responses:
 *       200:
 *         description: Saare orders ka array.
 */
router.get('/orders/all', adminController.getAllOrders);

/**
 * @swagger
 * /api/admin/orders/status/{id}:
 *   patch:
 *     summary: Ek order ka status update karna (Admin Only)
 *     tags: [4. Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Order ki ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [Processing, Packed, Shipped, Delivered, Cancelled], example: "Shipped" }
 *     responses:
 *       200:
 *         description: Order ka status kamyabi se update ho gaya.
 */
router.patch('/orders/status/:id', adminController.updateOrderStatus);


module.exports = router;