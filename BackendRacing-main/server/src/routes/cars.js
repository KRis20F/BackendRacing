const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const carController = require('../controllers/carController');
const auth = require('../middleware/auth');

// Rutas públicas
router.get('/', carController.getAllCars);
router.get('/category/:category', carController.getCarsByCategory);
router.get('/:id', carController.getCarById);

// Rutas protegidas
router.get('/user/:userId', auth, carController.getUserCars);

// GET /api/cars/listings
router.get('/listings', async (req, res) => {
  try {
    const [cars] = await sequelize.query(`
      SELECT 
        id,
        id as "carId",
        name,
        price,
        category,
        model_path,
        specs->'stats' as stats
      FROM "Cars"
      ORDER BY id ASC
    `);

    const listings = cars.map(({id, carId, name, price, category, stats, model_path}) => ({
        id,
        carId, 
        name,
        price,
        seller: category,
        stats,
        modelPath: model_path  // Agregamos el path del modelo 3D
      }));

    res.json({ listings });
  } catch (error) {
    console.error('Error al obtener listings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;