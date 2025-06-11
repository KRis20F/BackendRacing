const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const BillingInfo = sequelize.define('BillingInfo', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  name: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, allowNull: false },
  vat_number: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'billing_info',
  timestamps: false
});

BillingInfo.belongsTo(User, { foreignKey: 'user_id' });

module.exports = BillingInfo; 