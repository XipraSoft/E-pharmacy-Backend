const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: 6. Shopping Cart
 *   description: Logged-in user ke liye shopping cart ka management. (Authorization Token Zaroori Hai)
 */

// Cart ke saare routes protected hain, kyunki har cart ek user se jura hai
router.use(verifyToken);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Logged-in user ka mojooda cart dekhna
 *     tags: [6. Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User ke cart ki poori details (items aur unki medicine details ke saath).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 1 }
 *                 user_id: { type: integer, example: 1 }
 *                 CartItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer, example: 1 }
 *                       quantity: { type: integer, example: 3 }
 *                       Medicine:
 *                         type: object
 *                         properties:
 *                           id: { type: integer, example: 1 }
 *                           name: { type: string, example: "Panadol" }
 *                           price: { type: number, example: 40.00 }
 *                           image_url: { type: string, example: "uploads/image.jpg" }
 *       401:
 *         description: Unauthorized.
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Cart mein nayi medicine add karna (ya quantity barhana)
 *     tags: [6. Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [medicineId, quantity]
 *             properties:
 *               medicineId:
 *                 type: integer
 *                 description: Add ki jane wali medicine ki ID.
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 description: Kitni quantity add karni hai.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item kamyabi se cart mein add/update ho gaya.
 *       404:
 *         description: Di gayi ID wali medicine nahi mili.
 */
router.post('/add', cartController.addItemToCart);

/**
 * @swagger
 * /api/cart/update/{itemId}:
 *   patch:
 *     summary: Cart ke andar ek item ki quantity update karna
 *     tags: [6. Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: CartItem ki ID (Medicine ki ID nahi).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Nayi quantity (0 se bari honi chahiye).
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cart item kamyabi se update ho gaya.
 *       404:
 *         description: Di gayi ID wala cart item nahi mila.
 */
router.patch('/update/:itemId', cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{itemId}:
 *   delete:
 *     summary: Cart se ek item ko remove karna
 *     tags: [6. Shopping Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: CartItem ki ID (Medicine ki ID nahi).
 *     responses:
 *       200:
 *         description: Item kamyabi se cart se remove ho gaya.
 *       404:
 *         description: Di gayi ID wala cart item nahi mila.
 */
router.delete('/remove/:itemId', cartController.removeItemFromCart);

module.exports = router;