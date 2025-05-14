const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Car = require('./Car');

const UserCar = sequelize.define('UserCar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  carId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Car,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'UserCars',
  timestamps: false
});

// Associations
UserCar.belongsTo(User, { foreignKey: 'userId' });
UserCar.belongsTo(Car, { foreignKey: 'carId' });

module.exports = UserCar; 