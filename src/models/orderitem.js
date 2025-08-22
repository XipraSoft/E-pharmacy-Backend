'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    
    static associate(models) {
        this.belongsTo(models.Order, { foreignKey: 'order_id' });
  this.belongsTo(models.Medicine, { foreignKey: 'medicine_id' });
    }
  }
  OrderItem.init({
    order_id: DataTypes.INTEGER,
    medicine_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};