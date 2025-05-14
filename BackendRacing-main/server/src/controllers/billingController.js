const { Connection, PublicKey } = require('@solana/web3.js');
const BillingTransaction = require('../models/BillingTransaction');
const User = require('../models/User');

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await BillingTransaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBalanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'publicKey']
    });

    if (!user || !user.publicKey) {
      return res.status(400).json({ error: 'User has no wallet' });
    }

    try {
      const publicKey = new PublicKey(user.publicKey);
      const balance = await connection.getBalance(publicKey);
      
      const history = await BillingTransaction.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 10
      });

      return res.json({
        currentBalance: balance / 1e9,
        history
      });
    } catch (solanaError) {
      console.error('Solana error:', solanaError);
      return res.status(500).json({ error: 'Error connecting to Solana network' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  getBalanceHistory
};