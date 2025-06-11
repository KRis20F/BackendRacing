const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const PaymentCard = sequelize.define('PaymentCard', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  card_number: { type: DataTypes.STRING, allowNull: false },
  card_holder: { type: DataTypes.STRING, allowNull: false },
  expiry_date: { type: DataTypes.STRING, allowNull: false },
  card_type: { type: DataTypes.STRING, allowNull: false },
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'payment_cards',
  timestamps: false
});

PaymentCard.belongsTo(User, { foreignKey: 'user_id' });

module.exports = PaymentCard; 