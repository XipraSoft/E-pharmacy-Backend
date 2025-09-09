const db = require('../models');
const { sequelize } = require('../models');

const Order = db.Order;
const OrderItem = db.OrderItem;
const Cart = db.Cart;
const CartItem = db.CartItem;
const Medicine = db.Medicine;
const Address = db.Address;


exports.placeOrder = async (req, res) => {
    const userId = req.user.id;
    const { addressId , paymentMethod} = req.body;
    if (!addressId || !paymentMethod) {
        return res.status(400).send({ message: "Shipping address and payment method are compulsory." });
    }
    const validPaymentMethods = ['COD', 'Stripe']; 
    if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).send({ message: "Invalid payment method." });
    }
    const t = await sequelize.transaction();

    
    try {
        const cart = await Cart.findOne({ where: { user_id: userId }, include: [CartItem] }, { transaction: t });
        const address = await Address.findOne({ where: { id: addressId, user_id: userId } }, { transaction: t });

        if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
            await t.rollback();
            return res.status(400).send({ message: "Your cart is empty." });
        }
        if (!address) {
            await t.rollback();
            return res.status(404).send({ message: "Address not found." });
        }

        let totalAmount = 0;
        for (const item of cart.CartItems) {
            const medicine = await Medicine.findByPk(item.medicine_id, { transaction: t });
            if (medicine.inventory_quantity < item.quantity) {
                await t.rollback();
                return res.status(400).send({ message: `Stock is finished: ${medicine.name}` });
            }
            totalAmount += medicine.price * item.quantity;
        }

    let paymentStatus;
    let orderStatus='Pending';
    if(paymentMethod==='COD'){
        paymentStatus='Pending';
        orderStatus='Processing';
    }
    else if(paymentMethod==='Stripe'){
        paymentStatus='Pending';
        orderStatus='Pending';
    }
        const newOrder = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            shipping_address: `${address.street}, ${address.city}, ${address.state} - ${address.zip_code}`,
            status: 'Pending',
            payment_status: 'Pending'
        }, { transaction: t });

        for (const item of cart.CartItems) {
            const medicine = await Medicine.findByPk(item.medicine_id, { transaction: t });
            await OrderItem.create({
                order_id: newOrder.id,
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                price: medicine.price
            }, { transaction: t });

            medicine.inventory_quantity -= item.quantity;
            await medicine.save({ transaction: t });
        }

        await CartItem.destroy({ where: { cart_id: cart.id } }, { transaction: t });

        await t.commit();
        res.status(201).send({ message: "Order placed successfully!", order: newOrder , PaymentRequest : paymentMethod==='Stripe'});

    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'total_amount', 'status', 'payment_status', 'createdAt']
        });
        res.status(200).send(orders);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const order = await Order.findOne({
            where: { id: orderId, user_id: userId },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [Medicine]
            }]
        });

        if (!order) {
            return res.status(404).send({ message: "Order not found." });
        }
        res.status(200).send(order);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.cancelMyOrder = async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        // Step 1: User ka order dhoondna
        const order = await Order.findOne({ 
            where: { id: orderId, user_id: userId } 
        }, { transaction: t });

        if (!order) {
            await t.rollback();
            return res.status(404).send({ message: "Order not found." });
        }

        // Step 2: Shart check karna - Sirf 'Pending' ya 'Processing' status wale orders hi cancel ho sakte hain
        if (order.status !== 'Pending' && order.status !== 'Processing') {
            await t.rollback();
            return res.status(400).send({ 
                message: `This order cannot be cancelled as its status is '${order.status}'.` 
            });
        }

        // Step 3: Inventory ko wapas add karna (Bohat Zaroori)
        const orderItems = await OrderItem.findAll({ where: { order_id: orderId } }, { transaction: t });
        
        for (const item of orderItems) {
            // Medicine ki quantity ko wapas barha dena
            await Medicine.increment(
                'inventory_quantity', 
                { 
                    by: item.quantity, 
                    where: { id: item.medicine_id },
                    transaction: t 
                }
            );
        }

        // Step 4: Order ka status 'Cancelled' karna
        order.status = 'Cancelled';
        await order.save({ transaction: t });
        
        // (Optional: Agar payment pehle ho chuki thi (Stripe se), to yahan refund initiate karne ka logic aayega)

        await t.commit();
        res.status(200).send({ message: "Your order has been successfully cancelled.", order });

    } catch (error) {
        await t.rollback();
        res.status(500).send({ message: error.message });
    }
};