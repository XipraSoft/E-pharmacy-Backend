const db = require('../models');
const User = db.User;
const Image = db.Image;

exports.getProfile = async (req, res) => {
    try {
        
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [{
            model: Image,
            as: 'images',
            attributes: ['id', 'file_path']
        }]
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
    const t = await db.sequelize.transaction();
    try {
        const userId = req.user.id;
        const { name, phone, dob, gender, imageId } = req.body;

        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).send({ message: "User not found." });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (dob) user.dob = dob;
        if (gender) user.gender = gender;
        
        await user.save({ transaction: t });

        if (imageId) {
            await Image.update(
                { imageable_id: null, imageable_type: null },
                { where: { imageable_id: userId, imageable_type: 'user' }, transaction: t }
            );

            await Image.update(
                { imageable_id: userId, imageable_type: 'user' },
                { where: { id: imageId }, transaction: t }
            );
        }

        await t.commit();

        const updatedUser = await User.findByPk(userId, {
            include: [{
                model: Image,
                as: 'images',
                attributes: ['id', 'file_path']
            }]
        });

        res.status(200).send({
            message: "Profile created successfully",
            user: updatedUser
        });
    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};
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
