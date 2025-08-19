const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: 8. Payment
 *   description: Stripe payment gateway integration.
 */

/**
 * @swagger
 * /api/payment/create-checkout-session:
 *   post:
 *     summary: Ek order ke liye Stripe checkout session banana (User Only)
 *     tags: [8. Payment]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: 'object', required: ['orderId'], properties: { orderId: { type: 'integer' } } }
 *     responses:
 *       200:
 *         description: Stripe session ID.
 */
router.post('/create-checkout-session', [verifyToken], paymentController.createCheckoutSession);

/**
 * @swagger
 * /api/payment/webhook:
 *   post:
 *     summary: Stripe se aane wale events ko sunna (Stripe ke liye)
 *     tags: [8. Payment]
 *     description: Isay direct call na karein. Yeh Stripe ke liye hai.
 *     responses:
 *       200:
 *         description: Event receive ho gaya.
 */
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

module.exports = router;