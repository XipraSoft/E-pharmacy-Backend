const db = require('../models');
const Cart = db.Cart;
const CartItem = db.CartItem;
const Medicine = db.Medicine;

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
        cart = await Cart.create({ user_id: userId });
    }
    return cart;
};


exports.addItemToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { medicineId, quantity } = req.body;

        if (!medicineId || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "Medicine ID aur 0 se bari quantity zaroori hai." });
        }

        const cart = await getOrCreateCart(userId);
        const medicine = await Medicine.findByPk(medicineId);

        if (!medicine) {
            return res.status(404).send({ message: "Medicine nahi mili." });
        }

        let cartItem = await CartItem.findOne({
            where: { cart_id: cart.id, medicine_id: medicineId }
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                cart_id: cart.id,
                medicine_id: medicineId,
                quantity: quantity
            });
        }
        res.status(200).send({ message: "Item kamyabi se cart mein add ho gaya.", cartItem });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({
            where: { user_id: userId },
            include: [{
                model: CartItem,
                include: [{
                    model: Medicine, 
                    attributes: ['id', 'name', 'price', 'image_url']
                }]
            }]
        });

        if (!cart) {
            return res.status(200).send({ message: "Aapka cart khali hai.", items: [] });
        }
        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.itemId; 
        const { quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).send({ message: "Quantity 0 se bari honi chahiye." });
        }

        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            return res.status(404).send({ message: "Cart nahi mila." });
        }

        const [updated] = await CartItem.update({ quantity }, {
            where: { id: itemId, cart_id: cart.id }
        });

        if (updated) {
            res.status(200).send({ message: "Cart item kamyabi se update ho gaya." });
        } else {
            res.status(404).send({ message: "Cart item nahi mila." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.removeItemFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const itemId = req.params.itemId; 

        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            return res.status(404).send({ message: "Cart nahi mila." });
        }

        const deleted = await CartItem.destroy({
            where: { id: itemId, cart_id: cart.id }
        });

        if (deleted) {
            res.status(200).send({ message: "Item kamyabi se cart se remove ho gaya." });
        } else {
            res.status(404).send({ message: "Cart item nahi mila." });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};