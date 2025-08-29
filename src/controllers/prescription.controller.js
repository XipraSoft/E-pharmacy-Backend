const db = require('../models');
const Prescription = db.Prescription;
const Image = db.Image; 

exports.submitPrescription = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const userId = req.user.id;
        const { imageId } = req.body; 

        if (!imageId) {
            return res.status(400).send({ message: "Image id for prescription is compulsory" });
        }

        const newPrescription = await Prescription.create({  
            user_id: userId,
            status: 'Pending'
        }, { transaction: t });

        await Image.update(
            { 
                imageable_id: newPrescription.id, 
                imageable_type: 'prescription' 
            },
            { where: { id: imageId }, transaction: t }
        );

        await t.commit();
        res.status(201).send({ 
            message: "Prescription is submitted successfully ! Pharmacist will review it sooner.", 
            prescription: newPrescription 
        });
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.getMyPrescriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const prescriptions = await Prescription.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            include: [{
                model: Image,
                as: 'image', 
                attributes: ['file_path']
            }]
        });
        res.status(200).send(prescriptions);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};