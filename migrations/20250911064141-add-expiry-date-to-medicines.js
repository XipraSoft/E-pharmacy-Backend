'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Medicines', 'expiry_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
     
      defaultValue: '2099-12-31'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Medicines', 'expiry_date');
  }};


