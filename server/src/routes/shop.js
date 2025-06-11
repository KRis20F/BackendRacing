const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

// Comprar un auto nuevo de la tienda
router.post('/buy', auth, shopController.buyNewCar);

module.exports = router; 