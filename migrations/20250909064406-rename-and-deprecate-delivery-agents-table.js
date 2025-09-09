'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // DeliveryAgents table ka naam badalna
    await queryInterface.renameTable('DeliveryAgents', '_old_DeliveryAgents');
    
    // Orders table se purana foreign key constraint hatana
    // NOTE: Yahan constraint ka naam aapko apne database se dekhna hoga
    await queryInterface.removeConstraint('Orders', 'Orders_delivery_agent_id_fkey');
  },
  async down(queryInterface, Sequelize) {
    // Iska ulta karna
    await queryInterface.addConstraint('Orders', { /* ... purana constraint ... */ });
    await queryInterface.renameTable('_old_DeliveryAgents', 'DeliveryAgents');
  }
};