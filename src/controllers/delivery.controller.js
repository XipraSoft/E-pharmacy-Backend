const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DeliveryAgent = db.DeliveryAgent;
const Order = db.Order;
const User = db.User;

exports.getMyTasks = async (req, res) => {
    try {
        const agentId = req.user.id; 
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
        const agentId = req.user.id;
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