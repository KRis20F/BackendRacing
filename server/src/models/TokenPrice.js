const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenPrice = sequelize.define('TokenPrice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(18, 8),
    allowNull: false
  },
  volume: {
    type: DataTypes.DECIMAL(18, 8),
    defaultValue: 0
  },
  marketCap: {
    type: DataTypes.DECIMAL(18, 8),
    defaultValue: 0
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['date', 'token']
    }
  ]
});

module.exports = TokenPrice; 