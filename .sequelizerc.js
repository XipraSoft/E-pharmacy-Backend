const path = require('path');

// Yeh file Sequelize CLI ko batati hai ke aapke folders kahan hain.
module.exports = {
  // Config file ka path (src ke andar)
  'config': path.resolve('src', 'config', 'config.js'),

  // Models folder ka path (src ke andar)
  'models-path': path.resolve('src', 'models'),

  // Seeders folder ka path (root folder mein)
  'seeders-path': path.resolve('seeders'),

  // Migrations folder ka path (root folder mein)
  'migrations-path': path.resolve('migrations')
};
