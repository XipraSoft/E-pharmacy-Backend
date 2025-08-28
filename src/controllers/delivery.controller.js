const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DeliveryAgent = db.DeliveryAgent;
const Order = db.Order;

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send({ message: "Email and password is compulsory." });
        }

        const agent = await DeliveryAgent.findOne({ where: { email: email } });
        if (!agent) {
            return res.status(404).send({ message: "Agent not found." });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, agent.password);
        if (!isPasswordCorrect) {
            return res.status(401).send({ accessToken: null, message: "Wrong Password." });
        }

        const token = jwt.sign({ id: agent.id, type: 'delivery_agent' }, process.env.JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({ id: agent.id, name: agent.name, accessToken: token });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        const agentId = req.agent.id; 
        const tasks = await Order.findAll({
            where: { delivery_agent_id: agentId },
            order: [['createdAt', 'DESC']] 
        });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const agentId = req.agent.id;
        const orderId = req.params.orderId;
        const { status } = req.body; 

        if (!status) {
            return res.status(400).send({ message: "Status zaroori hai."});
        }

        const [updated] = await Order.update({ status: status }, {
            where: { id: orderId, delivery_agent_id: agentId }
        });

        if (updated) {
            res.status(200).send({ message: `Order  status '${status}' is updated now.` });
        } else {
            res.status(404).send({ message: "Order not found or you cannot update it." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};