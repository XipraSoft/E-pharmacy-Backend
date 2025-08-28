const jwt = require('jsonwebtoken');

exports.verifyAgentToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({ message: "Koi token nahi diya gaya!" });
    }
    try {
        token = token.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err || decoded.type !== 'delivery_agent') {
                return res.status(401).send({ message: "Unauthorized! Agent token is compulsory." });
            }
            req.agent = decoded; 
            next();
        });
    } catch (error) {
        return res.status(401).send({ message: "Unauthorized!" });
    }
};

