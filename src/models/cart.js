'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    
    static associate(models) {
  this.belongsTo(models.User, { foreignKey: 'user_id' });
  this.hasMany(models.CartItem, { foreignKey: 'cart_id' });    }
  }
  Cart.init({
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Cart',
  });
  return Cart;
};