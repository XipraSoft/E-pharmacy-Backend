const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { verifyToken } = require('../middleware/auth.middleware');


router.use(verifyToken);


router.get('/', wishlistController.getWishlist);

router.post('/add', wishlistController.addItemToWishlist);


router.delete('/remove/:medicineId', wishlistController.removeItemFromWishlist);

module.exports = router;