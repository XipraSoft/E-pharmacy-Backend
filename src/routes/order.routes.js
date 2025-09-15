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


router.post('/checkout', orderController.placeOrder);

router.get('/', orderController.getOrderHistory);

router.get('/:id', orderController.getOrderDetails);

router.patch('/:id/cancel', orderController.cancelMyOrder);


router.post('/:id/return', orderController.requestReturn);

module.exports = router;