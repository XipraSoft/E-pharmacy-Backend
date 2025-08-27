const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { verifyToken } = require('../middleware/auth.middleware');



router.use(verifyToken);


router.post('/', prescriptionController.submitPrescription);


 
router.get('/', prescriptionController.getMyPrescriptions);

module.exports = router;