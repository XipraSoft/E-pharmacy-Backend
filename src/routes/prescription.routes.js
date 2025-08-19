const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadPrescription } = require('../middleware/upload.middleware'); // Naye uploader ko import karein

// Is file ke saare routes protected hain
router.use(verifyToken);

// Prescription upload karna
router.post('/upload', uploadPrescription.single('prescriptionFile'), prescriptionController.uploadPrescription);

// Apni saari prescriptions dekhna
router.get('/', prescriptionController.getMyPrescriptions);

module.exports = router;