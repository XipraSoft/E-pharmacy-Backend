'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Medicine extends Model {
  
    static associate(models) {
       this.hasMany(models.CartItem, { foreignKey: 'medicine_id' });
       this.hasMany(models.OrderItem, { foreignKey: 'medicine_id' });
       this.hasMany(models.Image, {
    foreignKey: 'imageable_id',
    constraints: false,
    scope: { imageable_type: 'medicine' },
    as: 'images'
  });
  this.hasMany(models.WishlistItem, { foreignKey: 'medicine_id' });
    }
  }
  Medicine.init({
    name: DataTypes.STRING,
    brand: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    dosage: DataTypes.STRING,
    side_effects: DataTypes.TEXT,
    requires_prescription: DataTypes.BOOLEAN,
    inventory_quantity: DataTypes.INTEGER,
    
     category: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Medicine',
  }
);
  return Medicine;
};