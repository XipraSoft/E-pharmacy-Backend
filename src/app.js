const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const setupSwagger = require('../swagger.config');
const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payment', paymentRoutes);


app.use(cors());
const db = require('./models');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
setupSwagger(app);
app.use((req, res, next) => {
    console.log(`[APP.JS] Request aayi: ${req.method} ${req.originalUrl}`);
    next();
});
// ... middlewares ke baad ...

// ==========================================================
// ROUTES
// ==========================================================

app.get('/', (req, res) => {
    res.send('E-Pharmacy Backend Server is running successfully!');
});

// --- API Routes ---

// 1. Authentication routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// 2. User routes
const userRoutes = require('./routes/user.routes');
app.use('/api/user', userRoutes);

// 3. Address routes
const addressRoutes = require('./routes/address.routes');
app.use('/api/addresses', addressRoutes);

// 4. Medicine routes
const medicineRoutes = require('./routes/medicine.routes');
app.use('/api/medicines', medicineRoutes);

// 5. Admin routes
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);

// 6. Delivery routes
const deliveryRoutes = require('./routes/delivery.routes');
app.use('/api/delivery', deliveryRoutes);

const prescriptionRoutes = require('./routes/prescription.routes');
app.use('/api/prescriptions', prescriptionRoutes);

const cartRoutes = require('./routes/cart.routes');
app.use('/api/cart', cartRoutes);
// ... SERVER & DATABASE CONNECTION ...

const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);



const PORT = process.env.PORT || 3000;

db.sequelize.sync()
    .then(() => {
        console.log("Database synced successfully.");
        app.listen(PORT, '0.0.0.0',() => {
            console.log(`Server is running on port ${PORT}.`);
        });
    })
    .catch(err => {
        console.error("Unable to sync database:", err);
    });