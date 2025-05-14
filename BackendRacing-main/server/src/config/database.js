const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

let sequelize; // Cambiar const por let

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  sequelize = new Sequelize({
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres', 
    password: process.env.DB_PASSWORD || '648auQio6p5sY6J',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 15432,
    dialect: 'postgres',
    logging: false
  });
}

module.exports = sequelize;