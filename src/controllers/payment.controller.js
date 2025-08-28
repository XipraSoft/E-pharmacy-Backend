const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models');
const Order = db.Order;

exports.createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.body;

        const order = await Order.findOne({ where: { id: orderId, user_id: userId }, include: ['items'] });
        if (!order) {
            return res.status(404).send({ message: "Order not found." });
        }

        const line_items = order.items.map(item => {
            return {
                price_data: {
                    currency: 'pkr', 
                    product_data: {
                        name: item.Medicine.name, 
                    },
                    unit_amount: item.price * 100, 
                },
                quantity: item.quantity
            }
        });
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/order-cancelled`,
            client_reference_id: order.id.toString() 
        });
        
        order.stripe_session_id = session.id;
        await order.save();
        
        res.status(200).send({ id: session.id });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.client_reference_id;

        await Order.update(
            { payment_status: 'Paid', status: 'Processing' }, 
            { where: { id: orderId } }
        );
    }

    res.status(200).send({ received: true });
};