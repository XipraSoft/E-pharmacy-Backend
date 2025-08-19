'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
   
    static associate(models) {
  this.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
}
  }
  Address.init({
    user_id: DataTypes.INTEGER,
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip_code: DataTypes.STRING,
    country: DataTypes.STRING,
    is_default: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Address',
  });
  return Address;
};