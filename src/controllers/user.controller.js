const db = require('../models');
const User = db.User;

exports.getProfile = async (req, res) => {
    try {
        
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        res.status(200).send(user);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, dob, gender } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (dob) user.dob = dob;       
        if (gender) user.gender = gender; 

        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.resetPasswordToken;

        res.status(200).send({
            message: "Profile updated successfully!",
            user: userResponse
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};