const db = require('../models');
const Medicine = db.Medicine;
const { Op } = require('sequelize'); 


exports.createMedicine = async (req, res) => {
      console.log("--- Nayi Medicine Request ---");
    console.log("Request Body:", req.body); // Yeh req.body ko print karega
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

// ... baaki functions ...

// 2. Medicine ko update karna (Admin Only)
exports.updateMedicine = async (req, res) => {
    try {
        const medicineId = req.params.id;
        
        // Medicine.update() ek array wapas karta hai: [numberOfAffectedRows]
        const [updatedRows] = await Medicine.update(req.body, { 
            where: { id: medicineId } 
        });

        // Ab hum check karenge ke waqai koi row update hui hai ya nahi
        if (updatedRows === 1) {
            // Agar 1 row update hui, to iska matlab hai medicine mil gayi thi
            res.status(200).send({ message: "Medicine kamyabi se update ho gayi." });
        } else {
            // Agar 0 rows update huin, to iska matlab hai uss ID ki medicine mili hi nahi
            res.status(404).send({ message: `Medicine ID: ${medicineId} nahi mili.` });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// ... baaki functions ...

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
        // Step 1: Query parameters ko URL se nikalna
        const { search, brand, category, sort, page, limit: queryLimit } = req.query;

        // Step 2: Pagination ke liye 'limit' aur 'offset' set karna
        const pageNum = parseInt(page) || 1;
        let limit = parseInt(queryLimit) || 30;
        if (limit > 30) limit = 30; // Maximum limit 30 par set kar di
        const offset = (pageNum - 1) * limit;

        // Step 3: Sequelize ke liye 'where' aur 'order' objects banana
        let whereClause = {};
        let orderClause = [];

        // --- Filtering ---
        if (brand) {
            whereClause.brand = brand;
        }
        if (category) {
            // Humne category ke liye alag table nahi banaya, isliye text se filter kar rahe hain
            whereClause.category = category;
        }

        // --- Searching ---
        if (search) {
            whereClause.name = {
                [Op.like]: `%${search}%`
            };
        }

        // --- Sorting ---
        if (sort) {
            if (sort === 'price_asc') orderClause.push(['price', 'ASC']);
            if (sort === 'price_desc') orderClause.push(['price', 'DESC']);
            if (sort === 'name_asc') orderClause.push(['name', 'ASC']);
            if (sort === 'name_desc') orderClause.push(['name', 'DESC']);
        }
        
        // Step 4: Database se data hasil karna ('findAndCountAll' pagination ke liye behtar hai)
        const { count, rows } = await Medicine.findAndCountAll({
            where: whereClause,
            order: orderClause,
            limit: limit,
            offset: offset
        });

        // Step 5: Kamyabi ka response bhejna
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
        // Step 1: Query parameter 'q' (query) se search text lena
        const { q } = req.query;

        // Agar search text khali hai ya bohat chota hai, to khali array bhejo
        if (!q || q.length < 2) {
            return res.status(200).send([]);
        }

        // Step 2: Database se match hone wale naam dhoondna
        const suggestions = await Medicine.findAll({
            where: {
                name: {
                    [Op.like]: `${q}%` // Shuru ke huroof match karein (e.g., 'pan%')
                }
            },
            limit: 10, // Sirf 10 suggestions bhejein
            attributes: ['id', 'name'] // Sirf ID aur Naam bhejein, poora object nahi
        });

        // Step 3: Kamyabi ka response bhejna
        res.status(200).send(suggestions);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};