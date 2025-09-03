const db = require('../models');
const Medicine = db.Medicine;
const { Op } = require('sequelize'); 
const moment = require('moment');


exports.createMedicine = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const { name, price, category, imageId } = req.body;

        const newMedicine = await Medicine.create({ name, price, category }, { transaction: t });

        if (imageId) {
            await Image.update(
                { imageable_id: newMedicine.id, imageable_type: 'medicine' },
                { where: { id: imageId }, transaction: t }
            );
        }

        await t.commit();
        res.status(201).send(newMedicine);
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
            res.status(200).send({ message: "Medicine deleted successfully." });
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
  const medicines = await Medicine.findAll({
        where: whereClause,
        order: orderClause,
        include: [{
            model: db.Discount,
            as: 'discounts',
            where: { // Sirf active aur valid date wale discounts lao
                is_active: true,
                start_date: { [Op.lte]: new Date() },
                end_date: { [Op.gte]: new Date() }
            },
            required: false // LEFT JOIN, taake jin par discount nahi hai woh bhi aayein
        }]
    });

    const medicinesWithFinalPrice = medicines.map(med => {
        const medJSON = med.toJSON();
        let finalPrice = medJSON.price;

        if (medJSON.discounts && medJSON.discounts.length > 0) {
            const discount = medJSON.discounts[0]; // Abhi hum sirf pehla valid discount le rahe hain
            if (discount.discount_type === 'percentage') {
                finalPrice = finalPrice - (finalPrice * (discount.discount_value / 100));
            } else if (discount.discount_type === 'fixed') {
                finalPrice = finalPrice - discount.discount_value;
            }
        }
        medJSON.final_price = Math.max(0, finalPrice); // Price negative na ho
        delete medJSON.discounts; // Extra data hata dein
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