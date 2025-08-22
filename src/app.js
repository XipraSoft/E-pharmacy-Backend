const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const setupSwagger = require('../swagger.config');
app.use('/api/payment', require('./routes/payment.routes'));

const passport = require('passport');
require('./config/passport.config');

app.use(cors());
const db = require('./models');

app.use(express.json());
app.use(passport.initialize()); 
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
setupSwagger(app);
app.use((req, res, next) => {
    console.log(`[APP.JS] Request aayi: ${req.method} ${req.originalUrl}`);
    next();
});


app.get('/', (req, res) => {
    res.send('E-Pharmacy Backend Server is running successfully!');
});

app.use('/api/auth',require('./routes/auth.routes'));


app.use('/api/user', require('./routes/user.routes'));


app.use('/api/addresses', require('./routes/address.routes'));


app.use('/api/medicines', require('./routes/medicine.routes'));


app.use('/api/admin',require('./routes/admin.routes'));


app.use('/api/delivery', require('./routes/delivery.routes'));

app.use('/api/prescriptions', require('./routes/prescription.routes'));

app.use('/api/cart', require('./routes/cart.routes'));

app.use('/api/orders', require('./routes/order.routes'));



module.exports = app;