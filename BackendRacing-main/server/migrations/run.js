const { Pool } = require('pg');
const { readFileSync } = require('fs');
const { join } = require('path');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'racingdb',
  password: process.env.PGPASSWORD || 'tu_password',
  port: process.env.PGPORT || 5432,
});

async function runMigrations() {
  try {
    // Leer y ejecutar alter_wallets.sql
    const alterWalletsSql = readFileSync(join(__dirname, 'alter_wallets.sql'), 'utf8');
    await pool.query(alterWalletsSql);
    console.log('✅ Migración de alter_wallets completada');

    // Leer y ejecutar exchange_tables.sql
    const exchangeSql = readFileSync(join(__dirname, 'exchange_tables.sql'), 'utf8');
    await pool.query(exchangeSql);
    console.log('✅ Migración de exchange_tables completada');

    // Leer y ejecutar payment_tables.sql
    const paymentSql = readFileSync(join(__dirname, 'payment_tables.sql'), 'utf8');
    await pool.query(paymentSql);
    console.log('✅ Migración de payment_tables completada');

    console.log('✨ Todas las migraciones completadas exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations(); 