const db = require('../models');
const { sequelize } = require('../models'); // Transaction ke liye

// Saare Models
const Order = db.Order;
const OrderItem = db.OrderItem;
const Cart = db.Cart;
const CartItem = db.CartItem;
const Medicine = db.Medicine;
const Address = db.Address;


// 1. Order Place Karna
exports.placeOrder = async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.body;

    if (!addressId) {
        return res.status(400).send({ message: "Shipping address zaroori hai." });
    }

    // Sequelize Transaction Shuru Karein
    const t = await sequelize.transaction();

    try {
        // Step 1: User ka cart aur address hasil karna
        const cart = await Cart.findOne({ where: { user_id: userId }, include: [CartItem] }, { transaction: t });
        const address = await Address.findOne({ where: { id: addressId, user_id: userId } }, { transaction: t });

        if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
            await t.rollback();
            return res.status(400).send({ message: "Aapka cart khali hai." });
        }
        if (!address) {
            await t.rollback();
            return res.status(404).send({ message: "Address nahi mila." });
        }

        let totalAmount = 0;

        // Step 2: Har item ka stock check karna aur total amount calculate karna
        for (const item of cart.CartItems) {
            const medicine = await Medicine.findByPk(item.medicine_id, { transaction: t });
            if (medicine.inventory_quantity < item.quantity) {
                await t.rollback();
                return res.status(400).send({ message: `Stock khatam ho gaya hai: ${medicine.name}` });
            }
            totalAmount += medicine.price * item.quantity;
        }

        // Step 3: Naya Order banana
        const newOrder = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            shipping_address: `${address.street}, ${address.city}, ${address.state} - ${address.zip_code}`,
            status: 'Pending', // Initial status
            payment_status: 'Pending'
        }, { transaction: t });

        // Step 4: Cart items ko OrderItems mein move karna aur inventory update karna
        for (const item of cart.CartItems) {
            const medicine = await Medicine.findByPk(item.medicine_id, { transaction: t });
            await OrderItem.create({
                order_id: newOrder.id,
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                price: medicine.price // Us waqt ki qeemat save karna
            }, { transaction: t });

            // Inventory update karna
            medicine.inventory_quantity -= item.quantity;
            await medicine.save({ transaction: t });
        }

        // Step 5: Cart ko khali karna
        await CartItem.destroy({ where: { cart_id: cart.id } }, { transaction: t });

        // Agar sab kuch theek hai, to transaction ko commit (save) kar dein
        await t.commit();
        res.status(201).send({ message: "Order kamyabi se place ho gaya!", order: newOrder });

    } catch (error) {
        // Agar koi bhi error aaye, to transaction ko rollback (undo) kar dein
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};