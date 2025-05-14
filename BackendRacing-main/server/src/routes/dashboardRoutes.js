const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/leaderboard', auth, dashboardController.getLeaderboard);
router.get('/token/price-history', dashboardController.getTokenPriceHistory);

module.exports = router; 