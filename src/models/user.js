'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
  
static associate(models) {
  this.hasMany(models.Address, {
    foreignKey: 'user_id',
    as: 'addresses'
  })
  this.hasOne(models.Cart, { foreignKey: 'user_id' });
  
  this.hasMany(models.Image,{foreignKey: 'imageable_id',
    constraints: false,
    scope: { imageable_type: 'user' },
    as: 'images'  }) ;
    this.hasOne(models.Wishlist, { foreignKey: 'user_id' });
    this.hasMany(models.Prescription, { foreignKey: 'user_id' });

}

}
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'customer'
    },
   isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
     
// ...
// ...
  }, {
    sequelize,
    modelName: 'User',
        paranoid: true,

  });
  return User;
};