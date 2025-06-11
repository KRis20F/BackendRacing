const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  publicKey: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    defaultValue: null
  },
  fechaNacimiento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalRaces: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rank: {
    type: DataTypes.STRING,
    defaultValue: 'Novice'
  },
  tokenBalance: {
    type: DataTypes.DECIMAL(18,8),
    defaultValue: 0
  },
  usdBalance: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  badges: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  transaction_limits: {
    type: DataTypes.JSON,
    defaultValue: {
      daily: 1000,
      monthly: 20000
    }
  },
  billing_preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      currency: 'USD',
      notifications: true
    }
  }
}, {
  timestamps: true
});

module.exports = User;