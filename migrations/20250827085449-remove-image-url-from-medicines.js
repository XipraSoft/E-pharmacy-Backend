'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Medicines', 'image_url');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Medicines', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};