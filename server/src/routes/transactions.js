const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const auth = require('../middleware/auth');

// Historial de transacciones de usuario
router.get('/history/:userId', auth, transactionsController.getUserHistory);

module.exports = router;