const sequelize = require('../config/database');
const BillingTransaction = require('../models/BillingTransaction');
const User = require('../models/User');

/**
 * @swagger
 * /api/billing/transactions:
 *   get:
 *     summary: Get user's transaction history
 *     tags: [Billing]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/billing/balance-history:
 *   get:
 *     summary: Get user's balance history
 *     tags: [Billing]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User's balance history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentBalance:
 *                   type: string
 *                   description: Current token balance
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       amount:
 *                         type: string
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *       400:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/billing/invoices:
 *   get:
 *     summary: Get user's invoices
 *     tags: [Billing]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   invoice_number:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   paid_at:
 *                     type: string
 *                     format: date-time
 *                   pdf_url:
 *                     type: string
 */

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener transacciones de billing_transactions
    const billingTransactions = await BillingTransaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    // Obtener transacciones del mercado de coches
    const carTransactions = await sequelize.query(`
      SELECT 
        cmt.id,
        cmt.car_id as "carId",
        cmt.seller_id as "sellerId",
        cmt.buyer_id as "buyerId",
        cmt.price as amount,
        'CAR_PURCHASE' as type,
        cmt.status,
        cmt.created_at,
        cmt.updated_at,
        c.name as "carName"
      FROM car_market_transactions cmt
      JOIN "Cars" c ON c.id = cmt.car_id
      WHERE cmt.seller_id = ? OR cmt.buyer_id = ?
      ORDER BY cmt.created_at DESC
    `, {
      replacements: [userId, userId],
      type: sequelize.QueryTypes.SELECT
    });

    // Convertir las transacciones de Sequelize a objetos planos
    const plainBillingTransactions = billingTransactions.map(t => t.get({ plain: true }));

    // Combinar y ordenar todas las transacciones por fecha
    const allTransactions = [...plainBillingTransactions, ...carTransactions]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log('Transacciones encontradas:', {
      billing: plainBillingTransactions.length,
      cars: carTransactions.length,
      total: allTransactions.length
    });

    res.json(allTransactions);
  } catch (error) {
    console.error('Error en getTransactions:', error);
    res.status(500).json({ error: error.message });
  }
};

const getBalanceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener usuario con su balance actual
    const [user] = await sequelize.query(`
      SELECT "tokenBalance", "publicKey"
      FROM "Users"
      WHERE id = ?
    `, { 
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Obtener historial de transacciones
    const history = await BillingTransaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Obtener historial de balance
    const balanceHistory = await sequelize.query(`
      SELECT *
      FROM balance_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });

    return res.json({
      currentBalance: user.tokenBalance,
      history,
      balanceHistory
    });
  } catch (error) {
    console.error('Error en getBalanceHistory:', error);
    return res.status(500).json({ error: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const invoices = await sequelize.query(`
      SELECT 
        id,
        invoice_number,
        amount,
        currency,
        type,
        status,
        created_at,
        paid_at,
        pdf_url
      FROM invoices
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error en getInvoices:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  getBalanceHistory,
  getInvoices
};