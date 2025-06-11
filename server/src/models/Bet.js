const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Bet = sequelize.define('Bet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pendiente'
  },
  winner_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'bets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Associations
Bet.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' });
Bet.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' });
Bet.belongsTo(User, { foreignKey: 'winner_id', as: 'winner' });

module.exports = Bet; 