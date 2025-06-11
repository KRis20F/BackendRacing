const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const sequelize = require('./src/config/database.js');
require('./src/models/associations');  // Import model associations
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');

// Import routes
const authRoutes = require('./src/routes/auth.js');
const billingRoutes = require('./src/routes/billingRoutes.js');
const dashboardRoutes = require('./src/routes/dashboardRoutes.js');
const raceRoutes = require('./src/routes/race');
const walletRoutes = require('./src/routes/wallet');
const exchangeRoutes = require('./src/routes/exchange');
const carRoutes = require('./src/routes/cars');
const marketplaceRoutes = require('./src/routes/marketplace');
const paymentRoutes = require('./src/routes/payment');
const transactionsRoutes = require('./src/routes/transactions');
const shopRoutes = require('./src/routes/shop');

dotenv.config();

// Verificar que las variables de entorno se cargan
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:15173', 'https://kris20f.github.io', 'https://backendracing-main.fly.dev/api-docs', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization', 'Range', 'Accept'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Servir archivos estáticos
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/models3d', express.static(path.join(__dirname, 'static/models3d'))); 

// Swagger documentation route with persistent authorization
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpecs, {
  swaggerOptions: {
    persistAuthorization: true
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/race', raceRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/shop', shopRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API de Racing Game funcionando correctamente' });
});

// Health check route
app.get('/health', (req, res) => res.send('ok'));

// Start server with database connection retries
async function startServer() {
  let retries = 5;
  while (retries > 0) {
    try {
      // Test database connection
      await sequelize.authenticate();
      console.log('Conexión a la base de datos establecida correctamente.');

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
      });
      return;
    } catch (error) {
      console.error(`Intento ${6 - retries}/5 fallido:`, error);
      retries--;
      if (retries === 0) {
        console.error('Error al iniciar el servidor después de 5 intentos:', error);
        process.exit(1);
      }
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startServer();