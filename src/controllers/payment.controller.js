const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models');
const Order = db.Order;

// 1. Stripe Checkout Session Banana
exports.createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.body;

        // Order ko database se hasil karna
        const order = await Order.findOne({ where: { id: orderId, user_id: userId }, include: ['items'] });
        if (!order) {
            return res.status(404).send({ message: "Order nahi mila." });
        }

        // Stripe ke liye line items banana
        const line_items = order.items.map(item => {
            return {
                price_data: {
                    currency: 'pkr', // Aap apni currency set kar sakte hain
                    product_data: {
                        name: item.Medicine.name, // Iske liye association zaroori hai
                    },
                    unit_amount: item.price * 100, // Amount paisa/cents mein
                },
                quantity: item.quantity
            }
        });
        
        // Stripe Checkout Session banana
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/order-cancelled`,
            client_reference_id: order.id.toString() // Webhook ke liye zaroori
        });
        
        // Session ID ko apne order ke saath save karna
        order.stripe_session_id = session.id;
        await order.save();
        
        res.status(200).send({ id: session.id });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// 2. Stripe Webhook ko Handle Karna
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Event 'checkout.session.completed' ko handle karna
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.client_reference_id;

        // Database mein order ka status update karna
        await Order.update(
            { payment_status: 'Paid', status: 'Processing' }, 
            { where: { id: orderId } }
        );
    }

    res.status(200).send({ received: true });
};