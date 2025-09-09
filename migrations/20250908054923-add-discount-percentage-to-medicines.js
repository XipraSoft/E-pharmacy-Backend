'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Medicines', 'discount_percentage', {
      type: Sequelize.DECIMAL(5, 2), // e.g., 10.50%
      allowNull: true, // Null ho sakta hai agar discount na ho
      defaultValue: 0
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Medicines', 'discount_percentage');
  }
};