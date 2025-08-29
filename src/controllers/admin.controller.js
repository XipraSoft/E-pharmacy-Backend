const db = require('../models');
const DeliveryAgent = db.DeliveryAgent;
const Order = db.Order;
const bcrypt = require('bcryptjs');

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