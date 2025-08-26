const db = require('../models');
const User = db.User;

exports.getProfile = async (req, res) => {
    try {
        
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] }
        });

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        res.status(200).send(user);

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
//update profile
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
//deactivate account
exports.deactivateAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        await user.destroy();


        res.status(200).send({ message: "Your account got deleted successfully." });

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
//update profile image
exports.updateProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).send({ message: "Image file is compulsory." });
        }
        
        const imageUrl = req.file.path.replace(/\\/g, "/");

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }
        
       

        user.avatar_url = imageUrl;
        await user.save();

        res.status(200).send({
            message: "Profile image is updated successfully.",
            avatar_url: imageUrl
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};