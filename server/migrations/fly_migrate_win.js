const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const fs = require('fs/promises');
const path = require('path');

// Configurar la URL de la base de datos directamente
const DATABASE_URL = "postgres://postgres:mRbF7EVYNdWN1hy@racing-db.internal:5432/postgres";

async function runFlyMigrations() {
  try {
    // Configurar Sequelize con la URL de Fly.io
    const sequelize = new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    // Probar la conexión
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Leer y ejecutar los archivos SQL en orden
    const migrationFiles = [
      'user_tables.sql',
      'payment_tables.sql',
      'exchange_tables.sql'
    ];

    for (const file of migrationFiles) {
      console.log(`Ejecutando migración: ${file}`);
      const sqlPath = path.join(__dirname, file);
      const sqlContent = await fs.readFile(sqlPath, 'utf8');
      
      // Ejecutar el archivo SQL
      await sequelize.query(sqlContent);
      console.log(`Migración ${file} completada`);
    }

    console.log('Todas las migraciones se han ejecutado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
    process.exit(1);
  }
}

runFlyMigrations(); 