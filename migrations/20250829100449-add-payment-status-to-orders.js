'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'payment_status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Pending' // By default, har order ki payment pending hogi
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'payment_status');
  }
};
