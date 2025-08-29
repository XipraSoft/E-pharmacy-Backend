'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    
    static associate(models) {
  this.belongsTo(models.DeliveryAgent, { foreignKey: 'delivery_agent_id', as: 'agent' });
   this.belongsTo(models.User, { foreignKey: 'user_id' });
  this.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
}
  }
  Order.init({
    user_id: DataTypes.INTEGER,
    total_amount: DataTypes.DECIMAL,
    status: DataTypes.STRING,
    shipping_address: DataTypes.TEXT,
    payment_status:{
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
     stripe_session_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
    
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};