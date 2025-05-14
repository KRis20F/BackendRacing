const sequelize = require('../config/database');
const User = require('../models/User');
const RaceResult = require('../models/RaceResult');
const Bet = require('../models/Bet');
const BalanceHistory = require('../models/BalanceHistory');
const BillingTransaction = require('../models/BillingTransaction');
const Car = require('../models/Car');
const UserCar = require('../models/UserCar');

// Get user's general statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: [
        'level', 'experience', 'totalRaces', 'wins', 
        'losses', 'rank', 'tokenBalance', 'stats'
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get user's race history
const getUserRaceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const races = await RaceResult.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json(races);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get user's earnings statistics
const getUserEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total earnings from bets
    const betsEarnings = await Bet.sum('amount', {
      where: { 
        winner_id: userId,
        status: 'completed'
      }
    });

    // Get balance history
    const balanceHistory = await BalanceHistory.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      totalEarnings: betsEarnings || 0,
      recentHistory: balanceHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get user's achievements
const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['badges', 'stats']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      badges: user.badges,
      stats: user.stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get global statistics
const getGlobalStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalRaces = await RaceResult.count();
    const totalBets = await Bet.count();

    const topWinners = await User.findAll({
      attributes: ['username', 'wins'],
      order: [['wins', 'DESC']],
      limit: 5
    });

    res.json({
      totalUsers,
      totalRaces,
      totalBets,
      topWinners
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get top races
const getTopRaces = async (req, res) => {
  try {
    const races = await RaceResult.findAll({
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [['tiempo', 'ASC']],
      limit: 10
    });

    res.json(races);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get top earners
const getTopEarners = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['username', 'tokenBalance'],
      order: [['tokenBalance', 'DESC']],
      limit: 10
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Get market overview
const getMarketOverview = async (req, res) => {
  try {
    // Get total cars in market
    const totalCars = await Car.count();
    
    // Get most owned cars
    const popularCars = await UserCar.findAll({
      attributes: [
        'carId',
        [sequelize.fn('COUNT', sequelize.col('userId')), 'ownerCount']
      ],
      include: [{
        model: Car,
        attributes: ['name', 'price']
      }],
      group: ['carId', 'Car.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('userId')), 'DESC']],
      limit: 5
    });

    // Get recent transactions
    const recentTransactions = await BillingTransaction.findAll({
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      totalCars,
      popularCars,
      recentTransactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// Existing endpoints
const getLeaderboard = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT username, points FROM leaderboard ORDER BY points DESC LIMIT 5'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getTokenPriceHistory = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT to_char(date, 'Mon') AS name, price, 
       AVG(price) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as avg
       FROM token_price_history
       WHERE token = 'RacingCoin'
       ORDER BY date ASC
       LIMIT 12`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getUserStats,
  getUserRaceHistory,
  getUserEarnings,
  getUserAchievements,
  getGlobalStats,
  getTopRaces,
  getTopEarners,
  getMarketOverview,
  getLeaderboard,
  getTokenPriceHistory
};