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

// Historial de transacciones de un usuario (blockchain y exchanges)
const getUserHistory = async (req, res) => {
  const { userId } = req.params;

  // Verificar que el usuario existe y tiene wallet
  const [userResult] = await sequelize.query('SELECT id, publicKey FROM "Users" WHERE id = ?', { replacements: [userId] });
  const user = userResult[0];
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (!user.publicKey) return res.status(400).json({ error: 'El usuario no tiene wallet' });

  // Obtener historial completo
  const [history] = await sequelize.query(`
    SELECT 
      'transaction' as type,
      t.id,
      t.from_addr,
      t.to_addr,
      t.amount,
      t.signature,
      t.created_at,
      u1.username as from_username,
      u2.username as to_username
    FROM transactions t
    LEFT JOIN "Users" u1 ON t.from_addr = u1."publicKey"
    LEFT JOIN "Users" u2 ON t.to_addr = u2."publicKey"
    WHERE t.from_addr = ? OR t.to_addr = ?
    UNION ALL
    SELECT 
      'token_exchange' as type,
      te.id,
      te.from_addr,
      te.to_addr,
      te.amount,
      te.signature,
      te.created_at,
      u1.username as from_username,
      u2.username as to_username
    FROM token_exchanges te
    LEFT JOIN "Users" u1 ON te.from_addr = u1."publicKey"
    LEFT JOIN "Users" u2 ON te.to_addr = u2."publicKey"
    WHERE te.from_addr = ? OR te.to_addr = ?
    ORDER BY created_at DESC
  `, [user.publicKey, user.publicKey, user.publicKey, user.publicKey]);

  res.json({ history });
};

module.exports = {
  getUserHistory
};