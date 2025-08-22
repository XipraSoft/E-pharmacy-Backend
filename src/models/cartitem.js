'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
  
    static associate(models) {
        this.belongsTo(models.Cart, { foreignKey: 'cart_id' });
  this.belongsTo(models.Medicine, { foreignKey: 'medicine_id' });

    }
  }
  CartItem.init({
    cart_id: DataTypes.INTEGER,
    medicine_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CartItem',
  });
  return CartItem;
};