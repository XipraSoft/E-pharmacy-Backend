const db = require('../models');
const Medicine = db.Medicine;
const { Op } = require('sequelize'); 
const moment = require('moment');
const Image = db.Image;


exports.createMedicine = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { 
            name, 
            brand, 
            description,
            price, 
            dosage,
            side_effects,
            requires_prescription,
            inventory_quantity,
            expiry_date, 
            category,
            discount_percentage,
            imageId 
        } = req.body;

         const newMedicine = await Medicine.create({ 
            name, 
            brand,
            description,
            price, 
            dosage,
            side_effects,
            requires_prescription,
            inventory_quantity,
            expiry_date, 
            category,
            discount_percentage
        }, { transaction: t });

        if (imageId) {
            await Image.update(
                { imageable_id: newMedicine.id, imageable_type: 'medicine' },
                { where: { id: imageId }, transaction: t }
            );
        }

        await t.commit();
          const finalMedicineResponse = await Medicine.findByPk(newMedicine.id, {
        include: [{
            model: Image,
            as: 'images',
            attributes: ['id', 'file_path']
        }]
    });
        res.status(201).send(finalMedicineResponse);
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};


exports.updateMedicine = async (req, res) => {
    try {
        const medicineId = req.params.id;
        
        const [updatedRows] = await Medicine.update(req.body, { 
            where: { id: medicineId } 
        });

        if (updatedRows === 1) {
            res.status(200).send({ message: "Medicine updated successfully." });
        } else {
            res.status(404).send({ message: `Medicine ID: ${medicineId} not found.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


exports.deleteMedicine = async (req, res) => {
    try {
        const medicineId = req.params.id;
        const deletedRows = await Medicine.destroy({ where: { id: medicineId } });

        if (deletedRows === 1) {
            res.status(200).send({ message: "Medicine deleted successfully." });
        } else {
            res.status(404).send({ message: `Medicine ID: ${medicineId} not found.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};



exports.getAllMedicines = async (req, res) => {
    try {
        const { search, brand, category, sort, page, limit: queryLimit } = req.query;
        const pageNum = parseInt(page) || 1;
        let limit = parseInt(queryLimit) || 30;
        if (limit > 30) limit = 30; 
        const offset = (pageNum - 1) * limit;

        let whereClause = {};
        let orderClause = [];

        if (brand) {
            whereClause.brand = brand;
        }
        if (category) {
            whereClause.category = category;
        }

        if (search) {
            whereClause.name = {
                [Op.like]: `%${search}%`
            };
        }

        if (sort) {
            if (sort === 'price_asc') orderClause.push(['price', 'ASC']);
            if (sort === 'price_desc') orderClause.push(['price', 'DESC']);
            if (sort === 'name_asc') orderClause.push(['name', 'ASC']);
            if (sort === 'name_desc') orderClause.push(['name', 'DESC']);
        }
        
        const { count, rows } = await Medicine.findAndCountAll({
            where: whereClause,
            order: orderClause,
            limit: limit,
            offset: offset
        });

        // Final price calculate karna
        const medicinesWithFinalPrice = rows.map(med => {
            const medJSON = med.toJSON();
            let finalPrice = parseFloat(medJSON.price); // Price ko number mein convert karein

            // Agar discount hai aur 0 se bara hai
            if (medJSON.discount_percentage && parseFloat(medJSON.discount_percentage) > 0) {
                const discountAmount = finalPrice * (parseFloat(medJSON.discount_percentage) / 100);
                finalPrice = finalPrice - discountAmount;
            }
            
            medJSON.final_price = finalPrice.toFixed(2); // 2 decimal places tak
            return medJSON;
        });

       
        res.status(200).send({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: pageNum,
            medicines: rows,
            medicines: medicinesWithFinalPrice
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


exports.getMedicineById = async (req, res) => {
    try {
        const medicineId = req.params.id;
        const medicine = await Medicine.findByPk(medicineId);

        if (medicine) {
            res.status(200).send(medicine);
        } else {
            res.status(404).send({ message: `Medicine ID: ${medicineId} nahi mili.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getSearchSuggestions = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(200).send([]);
        }

        const suggestions = await Medicine.findAll({
            where: {
                name: {
                    [Op.like]: `${q}%` 
                }
            },
            limit: 10, 
            attributes: ['id', 'name'] 
        });

        res.status(200).send(suggestions);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


