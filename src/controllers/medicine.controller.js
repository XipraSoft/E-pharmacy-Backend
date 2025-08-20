const db = require('../models');
const Medicine = db.Medicine;
const { Op } = require('sequelize'); 


exports.createMedicine = async (req, res) => {
      console.log("--- Nayi Medicine Request ---");
    console.log("Request Body:", req.body); 
    console.log("Request File:", req.file); 

    try {
        const { name, brand, description, price, dosage, side_effects, requires_prescription, inventory_quantity, category } = req.body;
        
        if (!name || !price || inventory_quantity === undefined) {
            return res.status(400).send({ message: "Name, price, aur inventory quantity zaroori hain." });
        }
         let imageUrl;
        
        if (req.file) {
            imageUrl = req.file.path;
        } else {
            imageUrl = 'uploads/1.jpg'; 
        }

        const newMedicine = await Medicine.create({
            name, brand, description, price, dosage, side_effects, requires_prescription, inventory_quantity, image_url: imageUrl, category
        });
        res.status(201).send({ message: "Medicine kamyabi se add ho gayi!", medicine: newMedicine });
    } catch (error) {
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
            res.status(200).send({ message: "Medicine kamyabi se update ho gayi." });
        } else {
            res.status(404).send({ message: `Medicine ID: ${medicineId} nahi mili.` });
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
            res.status(200).send({ message: "Medicine kamyabi se delete ho gayi." });
        } else {
            res.status(404).send({ message: `Medicine ID: ${medicineId} nahi mili.` });
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

        res.status(200).send({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: pageNum,
            medicines: rows
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