const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth.middleware');


router.post('/create-checkout-session', [verifyToken], paymentController.createCheckoutSession);


module.exports = router;