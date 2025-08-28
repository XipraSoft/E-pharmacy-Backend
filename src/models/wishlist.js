'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
  
    static associate(models) {
     this.belongsTo(models.User, { foreignKey: 'user_id' });
     this.hasMany(models.WishlistItem, { foreignKey: 'wishlist_id', as:'WishlistItems' });  

    }
  }
  Wishlist.init({
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Wishlist',
  });
  return Wishlist;
};