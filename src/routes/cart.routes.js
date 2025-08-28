const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', cartController.getCart);


router.post('/add', cartController.addItemToCart);


router.patch('/update/:itemId', cartController.updateCartItem);

router.delete('/remove/:itemId', cartController.removeItemFromCart);

module.exports = router;