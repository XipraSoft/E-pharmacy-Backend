const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { verifyToken, hasRole } = require('../middleware/auth.middleware');


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
router.get('/tasks', [verifyToken, hasRole('delivery_agent')], deliveryController.getMyTasks);

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
router.patch('/tasks/:orderId/status',  [verifyToken, hasRole('delivery_agent')], deliveryController.updateTaskStatus);

module.exports = router;