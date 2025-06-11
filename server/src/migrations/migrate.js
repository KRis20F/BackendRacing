const path = require('path');
const fs = require('fs').promises;
const sequelize = require('../config/database');

async function migrate() {
  try {
    // Obtener todos los archivos de migración
    const migrationsDir = __dirname;
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.js') && f !== 'migrate.js')
      .sort();

    console.log('Ejecutando migraciones...');

    // Ejecutar cada migración en orden
    for (const file of migrationFiles) {
      console.log(`\nMigración: ${file}`);
      const migration = require(path.join(migrationsDir, file));
      
      try {
        await migration.up(sequelize.getQueryInterface(), sequelize);
        console.log(`✅ Migración ${file} completada`);
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(`⚠️ La tabla ya existe, continuando...`);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✨ Todas las migraciones completadas');
    
    // Cerrar la conexión
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrate(); 