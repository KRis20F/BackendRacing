const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  model_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  preview_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  thumbnail_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  specs: {
    type: DataTypes.JSONB,
    defaultValue: {
      power: "",
      acceleration: "",
      topSpeed: "",
      weight: ""
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'Cars',
  timestamps: false
});

module.exports = Car; 