const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const passport = require('passport');

const setupSwagger = require('../swagger.config');
require('./config/passport.config');

app.use(cors());
const paymentController = require('./controllers/payment.controller');
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use('/uploads', express.static('uploads'));

setupSwagger(app);



app.get('/', (req, res) => {
    res.send('E-Pharmacy Backend Server is running successfully!');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/addresses', require('./routes/address.routes'));
app.use('/api/medicines', require('./routes/medicine.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/delivery', require('./routes/delivery.routes'));
app.use('/api/upload', require('./routes/upload.routes')); 
app.use('/api/prescriptions', require('./routes/prescription.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/pages',require('./routes/page.routes'));





module.exports = app;