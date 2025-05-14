const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'tu_password',
  port: process.env.PGPORT || 5432,
});

async function runMigrations() {
  try {
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../../migrations/20240311_create_dashboard_tables.sql');
    const sqlContent = await fs.readFile(migrationPath, 'utf8');

    // Ejecutar las migraciones
    await pool.query(sqlContent);
    
    console.log('Migraciones ejecutadas correctamente');
    
    // Cerrar la conexión
    await pool.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

runMigrations(); 