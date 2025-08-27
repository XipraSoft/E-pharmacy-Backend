'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'avatar_url');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'avatar_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};