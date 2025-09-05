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
            return res.status(400).send({ message: "Medicine ID and quantity greater than 0 is compulsory." });
        }

        const cart = await getOrCreateCart(userId);
        const medicine = await Medicine.findByPk(medicineId);

        if (!medicine) {
            return res.status(404).send({ message: "Medicine not found." });
        }
        
        let cartItem = await CartItem.findOne({
            where: { cart_id: cart.id, medicine_id: medicineId }
        });
        const currentQuantity = cartItem ? cartItem.quantity : 0;
        const totalQuantity = currentQuantity + quantity;
        if (medicine.inventory_quantity < totalQuantity) {
            return res.status(400).send({ message: `Stock not available ${medicine.name}` });
        }
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
        res.status(200).send({ message: "Item has been added to cart successfully", cartItem });
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
                    as : 'Medicine',
                    include: [{ model: db.Image, as: 'images', attributes: ['file_path'] }]
                }]
            }]
        });

        if (!cart) {
            return res.status(200).send({ message: "The cart is empty", items: [] });
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
            return res.status(400).send({ message: "Quantity must be greater than 0" });
        }

        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            return res.status(404).send({ message: "Cart not found" });
        }

        const [updated] = await CartItem.update({ quantity }, {
            where: { id: itemId, cart_id: cart.id }
        });

        if (updated) {
            res.status(200).send({ message: "Cart item updated successfully" });
        } else {
            res.status(404).send({ message: "Cart item not found." });
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
            return res.status(404).send({ message: "Cart not found." });
        }

        const deleted = await CartItem.destroy({
            where: { id: itemId, cart_id: cart.id }
        });

        if (deleted) {
            res.status(200).send({ message: "Item added to cart successfully." });
        } else {
            res.status(404).send({ message: "Cart item not found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};