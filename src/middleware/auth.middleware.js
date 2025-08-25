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

module.exports = {
    verifyToken
};