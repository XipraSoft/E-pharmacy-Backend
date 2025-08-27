'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Images', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      file_path: { type: Sequelize.STRING, allowNull: false },
      
      imageable_id: { type: Sequelize.INTEGER, allowNull: false }, 
      imageable_type: { type: Sequelize.STRING, allowNull: false }, 
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Images');
  }
};