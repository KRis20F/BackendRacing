const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Bet = require('./Bet');

const RaceResult = sequelize.define('RaceResult', {
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
  rival_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  tiempo: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  posicion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bet_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Bet,
      key: 'id'
    }
  }
}, {
  tableName: 'race_results',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Associations
RaceResult.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
RaceResult.belongsTo(User, { foreignKey: 'rival_id', as: 'rival' });
RaceResult.belongsTo(Bet, { foreignKey: 'bet_id' });

module.exports = RaceResult; 