const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DeliveryAgent = db.DeliveryAgent;
const Order = db.Order;

// 1. Delivery Agent Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: "Email aur password zaroori hain." });
        }

        const agent = await DeliveryAgent.findOne({ where: { email: email } });
        if (!agent) {
            return res.status(404).send({ message: "Agent nahi mila." });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, agent.password);
        if (!isPasswordCorrect) {
            return res.status(401).send({ accessToken: null, message: "Password ghalat hai." });
        }

        // Agent ke liye alag JWT Token banana
        const token = jwt.sign({ id: agent.id, type: 'delivery_agent' }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({ id: agent.id, name: agent.name, accessToken: token });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 2. Apne Assigned Orders (Tasks) Dekhna
exports.getMyTasks = async (req, res) => {
    try {
        const agentId = req.agent.id; // Yeh middleware se aayega
        const tasks = await Order.findAll({
            where: { delivery_agent_id: agentId },
            order: [['createdAt', 'DESC']] // Sab se naye order pehle
        });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 3. Ek Order ka Status Update Karna
exports.updateTaskStatus = async (req, res) => {
    try {
        const agentId = req.agent.id;
        const orderId = req.params.orderId;
        const { status } = req.body; // e.g., "Out for Delivery", "Delivered", "Cancelled"

        if (!status) {
            return res.status(400).send({ message: "Status zaroori hai."});
        }

        const [updated] = await Order.update({ status: status }, {
            where: { id: orderId, delivery_agent_id: agentId }
        });

        if (updated) {
            res.status(200).send({ message: `Order ka status '${status}' par update ho gaya hai.` });
        } else {
            res.status(404).send({ message: "Order nahi mila ya aap isay update nahi kar sakte." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};