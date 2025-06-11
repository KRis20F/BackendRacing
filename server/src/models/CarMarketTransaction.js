const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CarMarketTransaction = sequelize.define('CarMarketTransaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  car_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Cars',
      key: 'id'
    }
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'RCF'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  },
  tx_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'sell'
  }
}, {
  tableName: 'car_market_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CarMarketTransaction; 