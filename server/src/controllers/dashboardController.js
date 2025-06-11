/**
 * @swagger
 * /api/dashboard/user/stats:
 *   get:
 *     summary: Get user's general statistics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 level:
 *                   type: integer
 *                 experience:
 *                   type: integer
 *                 totalRaces:
 *                   type: integer
 *                 wins:
 *                   type: integer
 *                 losses:
 *                   type: integer
 *                 rank:
 *                   type: string
 *                 tokenBalance:
 *                   type: string
 *                 stats:
 *                   type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/dashboard/leaderboard:
 *   get:
 *     summary: Get racing leaderboard
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Top players leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   points:
 *                     type: integer
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/dashboard/token/price-history:
 *   get:
 *     summary: Get token price history
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Token price history by month
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Month name
 *                   price:
 *                     type: number
 *                   avg:
 *                     type: number
 *                     description: 3-month moving average
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/dashboard/market-overview:
 *   get:
 *     summary: Get market overview statistics
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Market overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCars:
 *                   type: integer
 *                 popularCars:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       carId:
 *                         type: integer
 *                       ownerCount:
 *                         type: integer
 *                       Car:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                 recentTransactions:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const User = require('../models/User');
const RaceResult = require('../models/RaceResult');
const Bet = require('../models/Bet');
const BalanceHistory = require('../models/BalanceHistory');
const BillingTransaction = require('../models/BillingTransaction');
const Car = require('../models/Car');
const UserCar = require('../models/UserCar');
const TokenPrice = require('../models/TokenPrice');
const CarMarketTransaction = require('../models/CarMarketTransaction');

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
    let responseData = {
      totalCars: 0,
      popularCars: [],
      recentTransactions: [],
      marketStats: {
        totalVolume: '0',
        avgPrice: '0',
        activeListings: 0,
        last24hTransactions: 0
      }
    };

    try {
      // Get total cars in market
      responseData.totalCars = await Car.count();
    } catch (error) {
      console.error('Error getting total cars:', error);
    }
    
    try {
      // Get most owned cars with their details
      const popularCars = await UserCar.findAll({
        attributes: [
          'carId',
          [sequelize.fn('COUNT', sequelize.col('userId')), 'ownerCount']
        ],
        include: [{
          model: Car,
          attributes: ['name', 'price', 'category', 'specs']
        }],
        group: ['carId', 'Car.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('userId')), 'DESC']],
        limit: 5
      });

      responseData.popularCars = popularCars.map(car => ({
        carId: car.carId,
        ownerCount: parseInt(car.get('ownerCount')),
        Car: {
          name: car.Car.name,
          price: car.Car.price,
          category: car.Car.category,
          specs: car.Car.specs
        }
      }));
    } catch (error) {
      console.error('Error getting popular cars:', error);
    }

    try {
      // Get recent transactions with car and seller details
      const recentTransactions = await CarMarketTransaction.findAll({
        include: [
          {
            model: Car,
            attributes: ['name', 'category']
          },
          {
            model: User,
            as: 'seller',
            attributes: ['username']
          }
        ],
        where: {
          status: 'completed'
        },
        order: [['created_at', 'DESC']],
        limit: 5
      });

      responseData.recentTransactions = recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.tx_type,
        price: tx.price,
        currency: tx.currency,
        carName: tx.Car.name,
        category: tx.Car.category,
        seller: tx.seller.username,
        timestamp: tx.created_at
      }));
    } catch (error) {
      console.error('Error getting recent transactions:', error);
    }

    try {
      // Get market statistics
      const marketStats = await CarMarketTransaction.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalTransactions'],
          [sequelize.fn('SUM', sequelize.col('price')), 'totalVolume'],
          [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']
        ],
        where: {
          status: 'completed',
          created_at: {
            [sequelize.Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000)
          }
        }
      });

      // Get active listings count
      const activeListings = await CarMarketTransaction.count({
        where: {
          status: 'pending'
        }
      });

      responseData.marketStats = {
        totalVolume: marketStats[0]?.get('totalVolume') || '0',
        avgPrice: marketStats[0]?.get('avgPrice') || '0',
        activeListings: activeListings || 0,
        last24hTransactions: parseInt(marketStats[0]?.get('totalTransactions')) || 0
      };
    } catch (error) {
      console.error('Error getting market stats:', error);
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error getting market overview:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['username', ['wins', 'points']],
      order: [['wins', 'DESC']],
      limit: 5
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error en leaderboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getTokenPriceHistory = async (req, res) => {
  try {
    // Simulación de precio inicial y crecimiento de un token nuevo
    const initialPrice = 0.001; // Precio inicial bajo típico de tokens nuevos
    const mockPriceHistory = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let currentPrice = initialPrice;
    
    for (let i = 0; i < 12; i++) {
      // Simulamos diferentes fases del token:
      // - Primeros meses: crecimiento moderado
      // - Mitad del año: más volatilidad
      // - Últimos meses: estabilización con tendencia alcista
      let growthFactor;
      if (i < 4) {
        // Fase inicial: crecimiento moderado (10-30%)
        growthFactor = 1 + (Math.random() * 0.2 + 0.1);
      } else if (i < 8) {
        // Fase media: alta volatilidad (-20% a +50%)
        growthFactor = 1 + (Math.random() * 0.7 - 0.2);
      } else {
        // Fase final: estabilización (5-25%)
        growthFactor = 1 + (Math.random() * 0.2 + 0.05);
      }
      
      currentPrice *= growthFactor;
      
      // Calculamos el promedio móvil de 3 meses
      const avg = i < 2 ? currentPrice : 
        (mockPriceHistory[i-1].price + mockPriceHistory[i-2].price + currentPrice) / 3;
      
      mockPriceHistory.push({
        name: months[i],
        price: parseFloat(currentPrice.toFixed(8)),
        avg: parseFloat(avg.toFixed(8))
      });
    }

    res.json(mockPriceHistory);
  } catch (error) {
    console.error('Error generando historial de precios simulado:', error);
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