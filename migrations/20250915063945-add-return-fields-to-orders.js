'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'return_status', {
      type: Sequelize.STRING, // e.g., 'Requested', 'Approved', 'Rejected'
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'return_reason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'return_status');
    await queryInterface.removeColumn('Orders', 'return_reason');
  }
};