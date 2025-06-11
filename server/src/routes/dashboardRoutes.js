const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/leaderboard', auth, dashboardController.getLeaderboard);
router.get('/token/price-history', dashboardController.getTokenPriceHistory);

// New endpoints for comprehensive dashboard
router.get('/user/stats', auth, dashboardController.getUserStats);
router.get('/user/race-history', auth, dashboardController.getUserRaceHistory);
router.get('/user/earnings', auth, dashboardController.getUserEarnings);
router.get('/user/achievements', auth, dashboardController.getUserAchievements);
router.get('/global/stats', auth, dashboardController.getGlobalStats);
router.get('/top/races', auth, dashboardController.getTopRaces);
router.get('/top/earners', auth, dashboardController.getTopEarners);
router.get('/market-overview', auth, dashboardController.getMarketOverview);

module.exports = router; 