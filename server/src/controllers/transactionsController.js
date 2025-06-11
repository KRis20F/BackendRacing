/**
 * @swagger
 * /api/transactions/history/{userId}:
 *   get:
 *     summary: Get user's transaction history
 *     tags: [Transactions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User's transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [transaction, token_exchange]
 *                       id:
 *                         type: integer
 *                       from_addr:
 *                         type: string
 *                       to_addr:
 *                         type: string
 *                       amount:
 *                         type: string
 *                       signature:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       from_username:
 *                         type: string
 *                       to_username:
 *                         type: string
 *       400:
 *         description: User has no wallet
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const sequelize = require('../config/database');
const User = require('../models/User');
const BillingTransaction = require('../models/BillingTransaction');

const getUserHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Obtener usuario
    const [user] = await sequelize.query(`
      SELECT id, "publicKey" 
      FROM "Users" 
      WHERE id = ?
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener historial de transacciones
    const transactions = await BillingTransaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      user,
      transactions
    });

  } catch (error) {
    console.error('Error en getUserHistory:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserHistory
};