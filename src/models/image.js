'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       this.belongsTo(models.User, { foreignKey: 'imageable_id', constraints: false, as: 'user' });
  this.belongsTo(models.Medicine, { foreignKey: 'imageable_id', constraints: false, as: 'medicine' });
   this.belongsTo(models.Prescription, { foreignKey: 'imageable_id', constraints: false, as: 'prescription' });
    }
  }
  Image.init({
    file_path: DataTypes.STRING,
    imageable_id: DataTypes.INTEGER,
    imageable_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};