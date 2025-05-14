const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const sequelize = require('./src/config/database.js');
const authRoutes = require('./src/routes/auth.js');
const billingRoutes = require('./src/routes/billingRoutes.js');
const dashboardRoutes = require('./src/routes/dashboardRoutes.js');
const raceRoutes = require('./src/routes/race');
const walletRoutes = require('./src/routes/wallet');
const exchangeRoutes = require('./src/routes/exchange');
const carRoutes = require('./src/routes/cars');
const marketplaceRoutes = require('./src/routes/marketplace');

dotenv.config();

// Verificar que las variables de entorno se cargan
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
// Servir archivos estáticos
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/models3d', express.static(path.join(__dirname, '../public/models3d'))); 


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/race', raceRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Racing Game funcionando correctamente' });
});

app.get('/health', (req, res) => res.send('ok'));

// Iniciar servidor
async function startServer() {
  let retries = 5;
  while (retries > 0) {
    try {
      // Probar conexión a la base de datos
      await sequelize.authenticate();
      console.log('Conexión a la base de datos establecida correctamente.');

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
      });
      return; // Salir del bucle si todo está bien
    } catch (error) {
      console.error(`Intento ${6 - retries}/5 fallido:`, error);
      retries--;
      if (retries === 0) {
        console.error('Error al iniciar el servidor después de 5 intentos:', error);
        process.exit(1);
      }
      // Esperar 5 segundos antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startServer();