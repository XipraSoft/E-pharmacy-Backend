const db = require('../models');
const Prescription = db.Prescription;

// 1. User: Prescription Upload Karna
exports.uploadPrescription = async (req, res) => {
    try {
        const userId = req.user.id; // Logged-in user ki ID

        if (!req.file) {
            return res.status(400).send({ message: "Prescription ki file zaroori hai." });
        }
        
        const filePath = req.file.path.replace(/\\/g, "/");

        const newPrescription = await Prescription.create({
            user_id: userId,
            file_path: filePath,
            status: 'Pending' // By default status Pending hoga
        });

        res.status(201).send({ 
            message: "Prescription kamyabi se upload ho gayi! Pharmacist jald hi isay review karega.", 
            prescription: newPrescription 
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 2. User: Apni saari Prescriptions ka Status Dekhna
exports.getMyPrescriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const prescriptions = await Prescription.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).send(prescriptions);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};