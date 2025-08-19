'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeliveryAgent extends Model {
    
    
    static associate(models) {
  this.hasMany(models.Order, { foreignKey: 'delivery_agent_id', as: 'tasks' });
}
  }
  DeliveryAgent.init({
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DeliveryAgent',
  });
  return DeliveryAgent;
};