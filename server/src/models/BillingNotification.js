const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const BillingNotification = sequelize.define('BillingNotification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  message: { type: DataTypes.STRING, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'billing_notifications',
  timestamps: false
});

BillingNotification.belongsTo(User, { foreignKey: 'user_id' });

module.exports = BillingNotification; 