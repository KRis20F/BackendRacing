const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Pago en Solana
router.post('/send', auth, paymentController.sendPayment);

module.exports = router;