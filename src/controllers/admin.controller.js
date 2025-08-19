const db = require('../models');
const DeliveryAgent = db.DeliveryAgent;
const Order = db.Order;
const bcrypt = require('bcryptjs');

// Admin: Naya delivery agent add karna
exports.createDeliveryAgent = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).send({ message: "Saari fields zaroori hain." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const agent = await DeliveryAgent.create({ name, email, phone, password: hashedPassword });
        res.status(201).send({ message: "Delivery agent kamyabi se add ho gaya!", agent });
    } catch (error) { 
        res.status(500).send({ message: error.message }); 
    }
};

// Admin: Order ko agent ko assign karna
exports.assignOrderToAgent = async (req, res) => {
    try {
        const { orderId, agentId } = req.body;
        const order = await Order.findByPk(orderId);
        const agent = await DeliveryAgent.findByPk(agentId);

        if (!order || !agent) {
            return res.status(404).send({ message: "Order ya Agent nahi mila." });
        }

        order.delivery_agent_id = agentId;
        order.status = 'Assigned'; // Hum order ka status bhi update kar sakte hain
        await order.save();
        
        res.status(200).send({ message: `Order #${orderId} kamyabi se Agent #${agentId} ko assign ho gaya.` });

    } catch (error) { 
        res.status(500).send({ message: error.message }); 
    }
};