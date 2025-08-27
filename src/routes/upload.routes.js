const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken } = require('../middleware/auth.middleware');


const upload = require('../middleware/upload.middleware');

router.post('/', verifyToken, upload.array('image', 5), uploadController.uploadImage);

module.exports = router;