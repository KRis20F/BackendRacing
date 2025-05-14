const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const auth = require('../middleware/auth');

// Rutas públicas
router.get('/', carController.getAllCars);
router.get('/category/:category', carController.getCarsByCategory);
router.get('/:id', carController.getCarById);

// Rutas protegidas (requieren autenticación)
router.get('/user/:userId', auth, carController.getUserCars);

module.exports = router; 