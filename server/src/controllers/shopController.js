const sequelize = require('../config/database');
const crypto = require('crypto');

/**
 * @swagger
 * /api/shop/buy:
 *   post:
 *     summary: Buy a new car from the official shop
 *     tags: [Shop]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *             properties:
 *               carId:
 *                 type: integer
 *                 description: ID of the car to buy
 *     responses:
 *       200:
 *         description: Car purchase successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Compra realizada con éxito
 *                 carId:
 *                   type: integer
 *                 buyerId:
 *                   type: integer
 *                 price:
 *                   type: number
 *                 signature:
 *                   type: string
 *       400:
 *         description: Invalid request or insufficient funds
 *       404:
 *         description: Car not found
 *       500:
 *         description: Server error
 */

const buyNewCar = async (req, res) => {
  const { carId } = req.body;
  const buyerId = req.user.id; // Obtenido del token JWT

  try {
    // 1. Obtener información del auto y el comprador en una sola consulta
    const [[car], [buyer]] = await Promise.all([
      sequelize.query(`
        SELECT * FROM "Cars" WHERE id = ?
      `, { 
        replacements: [carId],
        type: sequelize.QueryTypes.SELECT 
      }),
      sequelize.query(`
        SELECT * FROM "Users" WHERE id = ?
      `, { 
        replacements: [buyerId],
        type: sequelize.QueryTypes.SELECT 
      })
    ]);

    // 2. Validaciones
    if (!car) {
      return res.status(404).json({ error: 'Auto no encontrado.' });
    }
    if (!buyer) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    if (!buyer.publicKey) {
      return res.status(400).json({ error: 'El usuario no tiene wallet.' });
    }
    if (parseFloat(buyer.tokenBalance) < parseFloat(car.price)) {
      return res.status(400).json({ error: 'Saldo insuficiente para comprar el auto.' });
    }

    // 3. Iniciar transacción
    const transaction = await sequelize.transaction();

    try {
      // 4. Restar saldo del comprador (esto activará el trigger update_balance_history)
      await sequelize.query(`
        UPDATE "Users" 
        SET "tokenBalance" = "tokenBalance" - ? 
        WHERE id = ?
      `, { 
        replacements: [car.price, buyerId],
        transaction 
      });

      // 5. Registrar la transacción de tokens
      const signature = crypto.randomBytes(32).toString('hex');
      await sequelize.query(`
        INSERT INTO token_exchanges (
          from_user_id, to_user_id, token, amount, signature, 
          from_username, to_username
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          buyerId,
          -1, // ID especial para la tienda
          'RCF',
          car.price,
          signature,
          buyer.username,
          'SHOP'
        ],
        transaction
      });

      // 6. Registrar la transacción del mercado
      await sequelize.query(`
        INSERT INTO car_market_transactions (
          car_id, seller_id, price, currency, status, tx_type, created_at, updated_at
        ) VALUES (?, ?, ?, 'RCF', 'completed', 'buy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        replacements: [
          carId,
          -1, // ID especial para la tienda
          car.price
        ],
        transaction
      });

      // 7. Registrar la transacción de facturación
      await sequelize.query(`
        INSERT INTO billing_transactions (
          user_id, amount, type, status, description, created_at, completed_at
        ) VALUES (?, ?, 'CAR_PURCHASE', 'completed', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        replacements: [
          buyerId,
          -car.price,
          `Compra de auto: ${car.name}`
        ],
        transaction
      });

      // 8. Asignar el auto al comprador
      await sequelize.query(`
        INSERT INTO "UserCars" ("userId", "carId", quantity)
        VALUES (?, ?, 1)
        ON CONFLICT ("userId", "carId") 
        DO UPDATE SET quantity = "UserCars".quantity + 1
      `, {
        replacements: [buyerId, carId],
        transaction
      });

      // 9. Confirmar la transacción
      await transaction.commit();

      res.json({
        status: 'ok',
        message: 'Compra realizada con éxito',
        carId,
        buyerId,
        price: car.price,
        signature
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error en buyNewCar:', error);
    res.status(500).json({ 
      error: 'Error al realizar la compra', 
      details: error.message 
    });
  }
};

module.exports = {
  buyNewCar
}; 