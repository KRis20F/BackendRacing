const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'postgres',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'racing-f1-db.internal',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  dialectOptions: {
    connectTimeout: 60000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  retry: {
    match: [/Deadlock/i, /Connection terminated/i, /ECONNRESET/, /ETIMEDOUT/, /ENOTFOUND/],
    max: 5,
    backoffBase: 1000,
    backoffExponent: 1.5
  },
  logging: false
});

// Agregar manejador de eventos para errores de conexión
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
    if (process.env.DATABASE_URL) {
      console.log('DATABASE_URL está configurado. Intentando con variables individuales...');
      // Si falla con DATABASE_URL, intentar con variables individuales
      sequelize = new Sequelize({
        database: process.env.DB_NAME || 'postgres',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      });
    }
  });

module.exports = sequelize;