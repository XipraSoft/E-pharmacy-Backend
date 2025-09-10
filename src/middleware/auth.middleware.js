const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    console.log("--- Token Verification Middleware ---");
    console.log("Token recieved from header:", token);

    if (!token) {
        return res.status(403).send({
            message: "Token is missing!"
        });
    }

    try {
        token = token.split(' ')[1]; 
        
        jwt.verify(token, 'this-is-some-secret', (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized! Token might be wrong."
                });
            }
            req.user = decoded;
            next(); 
        });
    } catch (error) {
         return res.status(401).send({
            message: "Unauthorized! Token might be wrong."
        });
    }
};

const hasRole = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const User = require('../models').User; 
            
            const user = await User.findByPk(req.user.id);
            if (user && user.role === requiredRole) {
                return next();
            }
            return res.status(403).send({ message: `Aapko '${requiredRole}' role ki zaroorat hai.` });
        } catch (error) {
            return res.status(500).send({ message: "Authentication mein masla hai." });
        }
    };
};
module.exports = {
    verifyToken, hasRole
}; 