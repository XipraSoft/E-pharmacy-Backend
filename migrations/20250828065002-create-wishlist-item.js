'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WishlistItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      wishlist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { // Foreign Key
          model: 'Wishlists', // 'Wishlists' table se jura hua hai
          key: 'id'
        },
        onDelete: 'CASCADE' // Agar wishlist delete ho, to uske items bhi delete ho jayein
      },
      medicine_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { // Foreign Key
          model: 'Medicines', // 'Medicines' table se jura hua hai
          key: 'id'
        },
        onDelete: 'CASCADE' // Agar medicine delete ho, to wishlist se bhi hat jaye
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('WishlistItems');
  }
};