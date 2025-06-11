const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/transactions', billingController.getTransactions);
router.get('/balance-history', billingController.getBalanceHistory);
router.get('/invoices', billingController.getInvoices);

module.exports = router;