const db = require('../models');
const User = db.User;

exports.isAdmin = async (req, res, next) => {
    try {
       
        const userId = req.user.id;
        
        const user = await User.findByPk(userId);

        if (user && user.role === 'admin') {
            return next();
        } else {
            return res.status(403).send({
                message: "Error: Admin access is compulsory!"
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: "There was a problem verifying admin access."
        });
    }
};