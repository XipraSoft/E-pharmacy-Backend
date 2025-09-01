const cron = require('node-cron');
const db = require('../models');
const { Op } = require('sequelize');
const sendEmail = require('./email');

const Medicine = db.Medicine;
const ADMIN_EMAIL = 'usmansipra264@gmail.com'; 

const scheduleLowStockAlert = () => {
  cron.schedule('* 1 * * *', async () => {
    console.log('Running a job to check for low stock items at 1:00 AM');
    try {
      const lowStockItems = await Medicine.findAll({
        where: { inventory_quantity: { [Op.lt]: 10 } }
      });

      if (lowStockItems.length > 0) {
        let message = 'The following items are running low on stock:\n\n';
        lowStockItems.forEach(item => {
          message += `- ${item.name} (Only ${item.inventory_quantity} left)\n`;
        });

        await sendEmail({
          email: ADMIN_EMAIL,
          subject: 'Low Inventory Alert!',
          message: message
        });
        console.log('Low stock alert email sent to admin.');
      } else {
        console.log('All items have sufficient stock. No alert needed.');
      }
    } catch (error) {
      console.error('Error in low stock cron job:', error);
    }
  });
};

module.exports = { scheduleLowStockAlert };