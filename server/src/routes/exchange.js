const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchangeController');
const auth = require('../middleware/auth');

// Transferencia de tokens
router.post('/token', auth, exchangeController.exchangeToken);

// Transferencia de NFT
router.post('/nft', auth, exchangeController.exchangeNFT);

// Crear orden (orderbook)
router.post('/order', auth, exchangeController.createOrder);

// Obtener orderbook
router.get('/orderbook', exchangeController.getOrderbook);

// Cancelar orden
router.post('/order/cancel', auth, exchangeController.cancelOrder);

// Obtener trades recientes
router.get('/recent-trades', exchangeController.getRecentTrades);

// (Puedes agregar aquí endpoints para historial, si los tienes en el controlador)

module.exports = router;