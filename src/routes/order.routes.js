const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: 7. Orders
 *   description: Order placement aur user ki order history. (Authorization Token Zaroori Hai)
 */

// Is file ke saare routes protected hain
router.use(verifyToken);

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: User ke cart se order place karna
 *     tags: [7. Orders]
 *     security: [{ bearerAuth: [] }]
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
 */
router.post('/checkout', orderController.placeOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Apni order history dekhna (Logged-in User)
 *     tags: [7. Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: User ke saare orders ka array.
 */
router.get('/', orderController.getOrderHistory);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Apne ek specific order ki details dekhna (Logged-in User)
 *     tags: [7. Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Order ki ID
 *     responses:
 *       200:
 *         description: Order ki poori details (items ke saath).
 *       404:
 *         description: Order nahi mila.
 */
router.get('/:id', orderController.getOrderDetails);

router.patch('/:id/cancel', orderController.cancelMyOrder);

module.exports = router;