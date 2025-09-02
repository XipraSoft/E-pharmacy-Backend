'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MedicineDiscount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MedicineDiscount.init({
    medicine_id: DataTypes.INTEGER,
    discount_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MedicineDiscount',
  });
  return MedicineDiscount;
};