'use-strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table mein 'deletedAt' ka naya column add karna
    await queryInterface.addColumn('Users', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true, // Yeh hamesha null hoga jab tak user delete na ho
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'deletedAt');
  }
};