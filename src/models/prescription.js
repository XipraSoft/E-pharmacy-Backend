'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Prescription extends Model {

    static associate(models) {
      this.hasOne(models.Image, {
    foreignKey: 'imageable_id',
    constraints: false,
    scope: { imageable_type: 'prescription' },
    as: 'image'
  });
    }
  }
  Prescription.init({
    user_id: DataTypes.INTEGER,
    file_path: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Prescription',
  });
  return Prescription;
};