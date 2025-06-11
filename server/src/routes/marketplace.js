const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const auth = require('../middleware/auth');

// Listar autos en venta
router.get('/listings', marketplaceController.getListings);

// Comprar un auto (NFT simulado)
router.post('/buy', auth, marketplaceController.buyCar);

// Vender un auto (listar en la tienda)
router.post('/sell', auth, marketplaceController.sellCar);

module.exports = router; 