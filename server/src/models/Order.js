const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  side: {
    type: DataTypes.ENUM('buy', 'sell'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('limit', 'market'),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  filled_amount: {
    type: DataTypes.DECIMAL,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open'
  },
  pair: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'orders',
  timestamps: false
});

Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Order; 