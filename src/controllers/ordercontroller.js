// src/controllers/order.controller.js

// NAYA FUNCTION: Ek order ke liye return request karna
exports.requestReturn = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).send({ message: "Return ki wajah batana zaroori hai." });
        }

        const order = await Order.findOne({ where: { id: orderId, user_id: userId } });
        if (!order) {
            return res.status(404).send({ message: "Order not found."});
        }

        // Sirf 'Delivered' orders hi return ho sakte hain
        if (order.status !== 'Delivered') {
            return res.status(400).send({ message: "Only delivered orders can be returned."});
        }
        
        // Check karein ke kahin pehle se to request nahi ki hui
        if (order.return_status) {
            return res.status(400).send({ message: "Is order ke liye pehle hi return request ki ja chuki hai."});
        }

        order.return_status = 'Requested';
        order.return_reason = reason;
        await order.save();        
        res.status(200).send({ message: "Your return request has been submitted successfully. Our team will review it shortly." });
    } catch (error) { 
        res.status(500).send({ message: error.message }); 
    }
};