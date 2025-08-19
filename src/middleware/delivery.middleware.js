const jwt = require('jsonwebtoken');

// Tasdeeq karein ke aapne function ke shuru mein 'exports.' likha hai
exports.verifyAgentToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({ message: "Koi token nahi diya gaya!" });
    }
    try {
        token = token.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            // Hum yeh bhi check kar rahe hain ke token agent ka hi hai
            if (err || decoded.type !== 'delivery_agent') {
                return res.status(401).send({ message: "Unauthorized! Agent token zaroori hai." });
            }
            req.agent = decoded; // Agent ki ID ko request mein save kar do
            next();
        });
    } catch (error) {
        return res.status(401).send({ message: "Unauthorized!" });
    }
};

// Yahan par koi aur 'module.exports = ...' ki line nahi honi chahiye