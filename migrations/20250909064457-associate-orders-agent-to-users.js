'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Naya constraint lagayein jo 'Users' table ko point kare
    await queryInterface.addConstraint('Orders', {
      fields: ['delivery_agent_id'],
      type: 'foreign key',
      name: 'Orders_delivery_agent_id_Users_fk', // Naya naam
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Orders', 'Orders_delivery_agent_id_Users_fk');
  }
};