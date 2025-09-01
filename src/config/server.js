const app = require('../app');         
const db = require('../models');      
const { scheduleLowStockAlert } = require('../utils/cron.jobs');

const PORT = process.env.PORT || 3000;

console.log("Connecting to the database.....");

db.sequelize.sync()
    .then(() => {
        console.log("Database synced successfully.");
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}.`);
            console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
             scheduleLowStockAlert();
        });
    })
    .catch(err => {
        console.error("Unable to sync database:", err);
        console.error("Please ensure your database server is running and configuration is correct.");
        process.exit(1);
    });