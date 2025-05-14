const sequelize = require('../config/database');

// Leaderboard (top 5)
const getLeaderboard = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      'SELECT username, points FROM leaderboard ORDER BY points DESC LIMIT 5'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Histórico de precios de RacingCoin (últimos 12 meses)
const getTokenPriceHistory = async (req, res) => {
  try {
    const [rows] = await sequelize.query(
      `SELECT to_char(date, 'Mon') AS name, price, AVG(price) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as avg
       FROM token_price_history
       WHERE token = 'RacingCoin'
       ORDER BY date ASC
       LIMIT 12`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLeaderboard,
  getTokenPriceHistory
};