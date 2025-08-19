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
                message: "Error: Admin access zaroori hai!"
            });
        }
    } catch (error) {
        return res.status(500).send({
            message: "Authentication mein masla aa raha hai. User ka role verify nahi ho pa raha."
        });
    }
};