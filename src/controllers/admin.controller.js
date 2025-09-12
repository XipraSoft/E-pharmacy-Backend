const db = require('../models');
const DeliveryAgent = db.DeliveryAgent;
const Order = db.Order;
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const Medicine = db.Medicine;
const prescription = db.Prescription;
const Prescription = db.Prescription;
const User = db.User;
const Discount = db.Discount;
const Address = db.Address;

exports.createDiscount = async (req, res) => {
    try {
        const newDiscount = await Discount.create(req.body);
        res.status(201).send(newDiscount);
    } catch (error) { res.status(500).send({ message: error.message }); }
};

exports.applyDiscountToMedicines = async (req, res) => {
    try {
        const { discountId, medicineIds } = req.body; 
        const discount = await Discount.findByPk(discountId);
        if (!discount) return res.status(404).send({ message: "Discount nahi mila." });

        await discount.addMedicines(medicineIds); 
        
        res.status(200).send({ message: "Discount kamyabi se apply ho gaya." });
    } catch (error) { res.status(500).send({ message: error.message }); }
};
exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        if (!role || (role !== 'customer' && role !== 'delivery_agent')) {
            return res.status(400).send({ message: "Role 'customer' ya 'delivery_agent' hona zaroori hai." });
        }
        // ... baaki validation ...
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, phone, password: hashedPassword, role, isVerified: true });
        res.status(201).send({ message: "User kamyabi se create ho gaya!", user: newUser });
    } catch (error) { 
        res.status(500).send({ message: error.message }); 
    }
};
exports.assignOrderToAgent = async (req, res) => {
    try {
        const { orderId, agentId } = req.body;
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).send({ message: `Order ID: ${orderId} nahi mila.` });
        }

        // Agent ko Users table se dhoondna (role check ke saath)
        const agent = await User.findOne({ where: { id: agentId, role: 'delivery_agent' } });
        if (!agent) {
            return res.status(404).send({ message: `Delivery Agent ID: ${agentId} nahi mila ya yeh user ek agent nahi hai.` });
        }

        order.delivery_agent_id = agentId;
        order.status = 'Assigned';
        await order.save();
        
        res.status(200).send({ message: `Order #${orderId} kamyabi se Agent #${agentId} ko assign ho gaya.` });
    } catch (error) { 
        res.status(500).send({ message: error.message }); 
    }
};
exports.getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const orders = await Order.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Assigned'];
        
        
        if (!validStatuses.includes(status)) {
            return res.status(400).send({ message: "Invalid status value." });
        }
        if (!status) {
            return res.status(400).send({ message: "Status is compulsory." });
        }

        const [updated] = await Order.update({ status: status }, {
            where: { id: orderId }
        });

        if (updated) {
            res.status(200).send({ message: `Order status'${status}' updated successfully` });
        } else {
            res.status(404).send({ message: "Order not found." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.count();
        const totalSales = await Order.sum('total_amount', { where: { payment_status: 'Paid' } });
        
        const pendingPrescriptions = 0; await Prescription.count({ where: { status: 'Pending' } });

        const lowInventoryThreshold = 10;
        const lowStockItems = await Medicine.count({
            where: { inventory_quantity: { [Op.lt]: lowInventoryThreshold } }
        });

        res.status(200).send({
            totalOrders,
            totalSales: totalSales || 0,
            pendingPrescriptions,
            lowStockItems
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getAllPrescriptions = async (req, res) => {
    try {
        const { status } = req.query;
        let whereClause = {};
        if (status) {
            whereClause.status = status;
        }

        const prescriptions = await Prescription.findAll({
            where: whereClause,
            include: [{ 
                model: User, 
                attributes: ['id', 'name', 'email'] 
            }],
            order: [['createdAt', 'DESC']] 
        });

        res.status(200).send(prescriptions);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.updatePrescriptionStatus = async (req, res) => {
    try {
        const prescriptionId = req.params.id;
        const { status, pharmacist_notes } = req.body;

        const validStatuses = ['Approved', 'Rejected'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).send({ message: "Status 'Approved' ya 'Rejected' hona chahiye." });
        }

        if (status === 'Rejected' && !pharmacist_notes) {
            return res.status(400).send({ message: "Rejected prescriptions ke liye notes (wajah) zaroori hain." });
        }
        
        const prescription = await Prescription.findByPk(prescriptionId);
        if (!prescription) {
            return res.status(404).send({ message: "Prescription nahi mili." });
        }

        prescription.status = status;
        if (pharmacist_notes) {
            prescription.pharmacist_notes = pharmacist_notes;
        }
        
        await prescription.save();

        res.status(200).send({ 
            message: `Prescription  '${status}'  set successfully.`,
            prescription
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getLowStockReport = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 10;

        const lowStockMedicines = await Medicine.findAll({
            where: {
                inventory_quantity: {
                    [Op.lte]: threshold 
                }
            },
            order: [['inventory_quantity', 'ASC']] 
        });

        res.status(200).send(lowStockMedicines);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await User.findAll({
            where: { role: 'customer' }, 
            attributes: ['id', 'name', 'email', 'phone', 'createdAt']
        });
        res.status(200).send(customers);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getCustomerDetails = async (req, res) => {
    try {
        const customerId = req.params.id;
        const customer = await User.findByPk(customerId, {
            attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
            include: [
                {
                    model: Order,
                    as: 'Orders', 
                    limit: 10, 
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: Prescription, 
                    as: 'Prescriptions', 
                    limit: 10
                },
                {
                    model: Address, 
                    as: 'addresses'
                }
            ]
        });

        if (!customer) {
            return res.status(404).send({ message: "Customer not found." });
        }
        res.status(200).send(customer);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// ==========================================================
exports.getBestSellingProducts = async (req, res) => {
    try {
        // Hum limit le sakte hain taake top 5 ya top 10 products dikhayein
        const limit = parseInt(req.query.limit) || 10; // Default top 10

        const bestSellers = await OrderItem.findAll({
            // Step 1: Attributes ko define karna
            attributes: [
                'medicine_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold']
            ],
            group: ['medicine_id', 'Medicine.id'], 
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: limit,
            include: [{
                model: Medicine,
                attributes: ['name', 'brand', 'price'] 
            }]
        });

        res.status(200).send(bestSellers);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getStockReport = async (req, res) => {
    try {
        const stockReport = await Medicine.findAll({
            attributes: ['id', 'name', 'brand', 'inventory_quantity'],
            order: [['inventory_quantity', 'ASC']] // Kam stock wale pehle
        });
        res.status(200).send(stockReport);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 2. Expiration Report (Jald expire hone wali medicines)
exports.getExpirationReport = async (req, res) => {
    try {
        // Hum un medicines ko dhoondenge jo agle X dino mein expire ho rahi hain
        const days = parseInt(req.query.days) || 30; // Default: agle 30 din
        
        const currentDate = new Date();
        const expirationLimitDate = new Date();
        expirationLimitDate.setDate(currentDate.getDate() + days);

        const expiringSoon = await Medicine.findAll({
            where: {
                expiry_date: {
                    [Op.between]: [currentDate, expirationLimitDate]
                }
            },
            order: [['expiry_date', 'ASC']] // Jo sab se jald expire ho rahi hain, woh pehle
        });

        res.status(200).send(expiringSoon);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};



exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let whereClause = {
            payment_status: 'Paid' // Sirf paid orders ki sale count karni hai
        };

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Step 2: Sales ko calculate karna
        // 2.1: Total Sales (Raqam)
        const totalSales = await Order.sum('total_amount', { where: whereClause });

        // 2.2: Total Orders (Ginti)
        const totalOrders = await Order.count({ where: whereClause });
        
        // 2.3: Har din ke hisab se sales (Graph ke liye)
        const salesByDay = await Order.findAll({
            where: whereClause,
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
            ],
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });
        
        res.status(200).send({
            totalSales: totalSales || 0,
            totalOrders: totalOrders || 0,
            salesByDay: salesByDay
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};