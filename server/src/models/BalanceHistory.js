const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const BalanceHistory = sequelize.define('BalanceHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  previous_balance: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
  new_balance: { type: DataTypes.DECIMAL(20, 8), allowNull: false },
  change_type: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'balance_history',
  timestamps: false
});

BalanceHistory.belongsTo(User, { foreignKey: 'user_id' });

module.exports = BalanceHistory; 