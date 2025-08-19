const db = require('../models');
const Address = db.Address;

exports.addAddress = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { street, city, state, zip_code, country } = req.body;

        const newAddress = await Address.create({
            user_id: userId,
            street, city, state, zip_code, country
        });
        res.status(201).send({ message: "Address kamyabi se add ho gaya!", address: newAddress });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


exports.getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.findAll({ where: { user_id: userId } });
        res.status(200).send(addresses);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id; 

        const address = await Address.findOne({ where: { id: addressId, user_id: userId } });
        if (!address) {
            return res.status(404).send({ message: "Address nahi mila ya aap isay delete nahi kar sakte." });
        }
        await address.destroy();
        res.status(200).send({ message: "Address kamyabi se delete ho gaya." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};