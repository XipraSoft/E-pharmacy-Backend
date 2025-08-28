'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WishlistItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Wishlist, { foreignKey: 'wishlist_id', as:'Wishlist' });
      this.belongsTo(models.Medicine, { foreignKey: 'medicine_id' });
    }
  }
  WishlistItem.init({
    wishlist_id: DataTypes.INTEGER,
    medicine_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'WishlistItem',
  });
  return WishlistItem;
};