const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];

    console.log("--- Token Verification Middleware ---");
    console.log("Header se mila Token:", token);

    if (!token) {
        return res.status(403).send({
            message: "Koi token nahi diya gaya!"
        });
    }

    try {
        token = token.split(' ')[1]; 
        
        jwt.verify(token, 'this-is-some-secret', (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized! Token ghalat hai."
                });
            }
            req.user = decoded;
            next(); 
        });
    } catch (error) {
         return res.status(401).send({
            message: "Unauthorized! Token ghalat hai."
        });
    }
};

module.exports = {
    verifyToken
};