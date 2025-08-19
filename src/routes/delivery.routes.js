const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { verifyAgentToken } = require('../middleware/delivery.middleware');

/**
 * @swagger
 * tags:
 *   name: 5. Delivery Agent
 *   description: Delivery agents ke liye makhsoos operations.
 */

/**
 * @swagger
 * /api/delivery/login:
 *   post:
 *     summary: Delivery agent ko login karwa kar token hasil karna
 *     tags: [5. Delivery Agent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "agent1@example.com" }
 *               password: { type: string, example: "agentpassword" }
 *     responses:
 *       200:
 *         description: Kamyab login, agent ka accessToken wapas milega.
 */
router.post('/login', deliveryController.login);

/**
 * @swagger
 * /api/delivery/tasks:
 *   get:
 *     summary: Apne saare assigned orders (tasks) dekhna (Agent Only)
 *     tags: [5. Delivery Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent ko assign kiye gaye orders ka array.
 */
router.get('/tasks', [verifyAgentToken], deliveryController.getMyTasks);

/**
 * @swagger
 * /api/delivery/tasks/{orderId}/status:
 *   patch:
 *     summary: Ek order ka status update karna (Agent Only)
 *     tags: [5. Delivery Agent]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               status: { type: string, enum: [Picked, "Out for Delivery", Delivered, Cancelled], example: "Delivered" }
 *     responses:
 *       200:
 *         description: Order ka status kamyabi se update ho gaya.
 */
router.patch('/tasks/:orderId/status', [verifyAgentToken], deliveryController.updateTaskStatus);

module.exports = router;