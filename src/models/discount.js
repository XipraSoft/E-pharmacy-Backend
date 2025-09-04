'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Discount extends Model {

    static associate(models) {
 this.belongsToMany(models.Medicine, { through: 'MedicineDiscounts', foreignKey: 'discount_id' });    }
  }
  Discount.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    discount_type: DataTypes.STRING,
    discount_value: DataTypes.DECIMAL,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Discount',
  });
  return Discount;
};