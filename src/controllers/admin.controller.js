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

// 1. Naya Discount Banana
exports.createDiscount = async (req, res) => {
    try {
        const newDiscount = await Discount.create(req.body);
        res.status(201).send(newDiscount);
    } catch (error) { res.status(500).send({ message: error.message }); }
};

// 2. Ek Discount ko Medicines par Apply Karna
exports.applyDiscountToMedicines = async (req, res) => {
    try {
        const { discountId, medicineIds } = req.body; // medicineIds ek array hoga [1, 2, 5]
        const discount = await Discount.findByPk(discountId);
        if (!discount) return res.status(404).send({ message: "Discount nahi mila." });

        await discount.addMedicines(medicineIds); // Sequelize ka magic function
        
        res.status(200).send({ message: "Discount kamyabi se apply ho gaya." });
    } catch (error) { res.status(500).send({ message: error.message }); }
};
exports.createDeliveryAgent = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).send({ message: "All fields are compulsory." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const agent = await DeliveryAgent.create({ name, email, phone, password: hashedPassword });
        res.status(201).send({ message: "Delivery Agent added successfully!", agent });
    } catch (error) { 
        res.status(500).send({ message: error.message }); 
    }
};

exports.assignOrderToAgent = async (req, res) => {
    try {
        const { orderId, agentId } = req.body;
        const order = await Order.findByPk(orderId);
        const agent = await DeliveryAgent.findByPk(agentId);

        if (!order || !agent) {
            return res.status(404).send({ message: "Order or Agent not found." });
        }

        order.delivery_agent_id = agentId;
        order.status = 'Assigned'; 
        await order.save();
        
        res.status(200).send({ message: `Order #${orderId} assigned to Agent #${agentId} .` });

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

// admin.controller.js
// ... baaki imports ...

// ... baaki functions ...

// NAYA FUNCTION: Dashboard ke liye Data Hasil Karna
exports.getDashboardStats = async (req, res) => {
    try {
        // Sales aur Orders ka count
        const totalOrders = await Order.count();
        const totalSales = await Order.sum('total_amount', { where: { payment_status: 'Paid' } });
        
        // Pending Prescriptions (Humne prescription ka feature skip kiya tha, to abhi ke liye 0)
        const pendingPrescriptions = 0; // await Prescription.count({ where: { status: 'Pending' } });

        // Low Inventory Alerts
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
        // Optional: Status se filter karna, e.g., ?status=Pending
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
            message: `Prescription kamyabi se '${status}' par set ho gayi hai.`,
            prescription
        });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getLowStockReport = async (req, res) => {
    try {
        // Hum threshold ko URL se bhi le sakte hain, ya default set kar sakte hain
        const threshold = parseInt(req.query.threshold) || 10; // Default threshold 10 hai

        // Hum yahan 'findAll' istemal karenge, 'count' nahi
        const lowStockMedicines = await Medicine.findAll({
            where: {
                inventory_quantity: {
                    [Op.lte]: threshold // Less than or equal to (lte)
                }
            },
            order: [['inventory_quantity', 'ASC']] // Sab se kam stock wale pehle
        });

        res.status(200).send(lowStockMedicines);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};