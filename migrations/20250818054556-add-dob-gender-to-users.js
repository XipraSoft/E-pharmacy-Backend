'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'dob', { // Date of Birth
      type: Sequelize.DATEONLY, // Sirf date save karega, time nahi
      allowNull: true // Shuru mein null ho sakta hai
    });
    await queryInterface.addColumn('Users', 'gender', {
      type: Sequelize.STRING,
      allowNull: true // Shuru mein null ho sakta hai
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'dob');
    await queryInterface.removeColumn('Users', 'gender');
  }
};