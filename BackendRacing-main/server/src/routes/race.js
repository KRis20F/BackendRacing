const express = require('express');
const router = express.Router();
const { createBet } = require('../controllers/betController');
const { raceResult } = require('../controllers/raceController');
const auth = require('../middleware/auth');

router.post('/bet/create', auth, createBet);
router.post('/race/result', auth, raceResult);

module.exports = router;
