const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: 7. Orders
 *   description: Order placement aur management. (Authorization Token Zaroori Hai)
 */

router.use(verifyToken);

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: User ke cart se order place karna
 *     tags: [7. Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId]
 *             properties:
 *               addressId:
 *                 type: integer
 *                 description: User ki address book se select kiye gaye address ki ID.
 *                 example: 1
 *     responses:
 *       201:
 *         description: Order kamyabi se place ho gaya.
 *       400:
 *         description: Cart khali hai ya stock khatam ho gaya hai.
 *       404:
 *         description: Address nahi mila.
 */
router.post('/checkout', orderController.placeOrder);

module.exports = router;