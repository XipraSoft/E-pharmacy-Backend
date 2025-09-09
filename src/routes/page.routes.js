const express = require('express');
const router = express.Router();
const pageController = require('../controllers/page.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/admin.middleware');


router.get('/', pageController.getAllPages);


router.get('/:slug', pageController.getPageBySlug);


router.post('/', [verifyToken, isAdmin], pageController.createOrUpdatePage);

module.exports = router;