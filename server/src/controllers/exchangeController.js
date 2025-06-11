/**
 * @swagger
 * /api/exchange/token:
 *   post:
 *     summary: Transfer tokens between users
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromUserId
 *               - toUserId
 *               - token
 *               - amount
 *             properties:
 *               fromUserId:
 *                 type: integer
 *                 description: ID of the sender
 *               toUserId:
 *                 type: integer
 *                 description: ID of the receiver
 *               token:
 *                 type: string
 *                 description: Token symbol or address
 *               amount:
 *                 type: string
 *                 description: Amount to transfer
 *     responses:
 *       200:
 *         description: Token transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 from:
 *                   $ref: '#/components/schemas/User'
 *                 to:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                 amount:
 *                   type: string
 *                 signature:
 *                   type: string
 *       400:
 *         description: Invalid parameters or missing wallet
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/exchange/nft:
 *   post:
 *     summary: Transfer NFT between users
 *     tags: [Exchange]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromUserId
 *               - toUserId
 *               - nft
 *             properties:
 *               fromUserId:
 *                 type: integer
 *                 description: ID of the sender
 *               toUserId:
 *                 type: integer
 *                 description: ID of the receiver
 *               nft:
 *                 type: string
 *                 description: NFT identifier or mint address
 *     responses:
 *       200:
 *         description: NFT transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 from:
 *                   $ref: '#/components/schemas/User'
 *                 to:
 *                   $ref: '#/components/schemas/User'
 *                 nft:
 *                   type: string
 *                 signature:
 *                   type: string
 *       400:
 *         description: Invalid parameters or missing wallet
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         publicKey:
 *           type: string
 */
const sequelize = require('../config/database');
const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');

// Transferencia de tokens
const exchangeToken = async (req, res) => {
  const { fromUserId, toUserId, token, amount } = req.body;
  if (!fromUserId || !toUserId || !token || !amount) return res.status(400).json({ error: 'Faltan parámetros' });

  const sender = await User.findByPk(fromUserId);
  const receiver = await User.findByPk(toUserId);
  if (!sender || !receiver) return res.status(404).json({ error: 'Usuario origen o destino no encontrado' });
  if (!sender.publicKey || !receiver.publicKey) return res.status(400).json({ error: 'Uno de los usuarios no tiene wallet' });

  const signature = crypto.randomBytes(32).toString('hex');
  await sequelize.query(`
    INSERT INTO token_exchanges (
      from_user_id, to_user_id, token, amount, signature,
      from_username, to_username
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, {
    replacements: [
      fromUserId,
      toUserId,
      token,
      amount,
      signature,
      sender.username,
      receiver.username
    ]
  });
  res.json({ status: 'ok', from: sender, to: receiver, token, amount, signature });
};

// Transferencia de NFT
const exchangeNFT = async (req, res) => {
  const { fromUserId, toUserId, nft } = req.body;
  if (!fromUserId || !toUserId || !nft) return res.status(400).json({ error: 'Faltan parámetros' });

  const sender = await User.findByPk(fromUserId);
  const receiver = await User.findByPk(toUserId);
  if (!sender || !receiver) return res.status(404).json({ error: 'Usuario origen o destino no encontrado' });
  if (!sender.publicKey || !receiver.publicKey) return res.status(400).json({ error: 'Uno de los usuarios no tiene wallet' });

  try {
    // Verificar que el remitente posee el NFT
    const [ownershipRows] = await sequelize.query(`
      SELECT * FROM "UserCars" 
      WHERE "userId" = ? AND "carId" = ?
    `, {
      replacements: [fromUserId, nft]
    });

    if (!ownershipRows.length) {
      return res.status(400).json({ error: 'El remitente no posee este NFT' });
    }

    // Verificar que el NFT no está en venta
    const [marketRows] = await sequelize.query(`
      SELECT * FROM car_market_transactions 
      WHERE car_id = ? AND status = 'en_venta'
    `, {
      replacements: [nft]
    });

    if (marketRows.length > 0) {
      return res.status(400).json({ error: 'Este NFT está actualmente listado en el marketplace' });
    }

    // Generar firma única para la transacción
    const signature = crypto.randomBytes(32).toString('hex');

    // Iniciar transacción para asegurar consistencia
    await sequelize.transaction(async (transaction) => {
      // 1. Registrar el intercambio de NFT
      await sequelize.query(`
        INSERT INTO nft_exchanges (
          from_addr, to_addr, nft, signature,
          from_user_id, to_user_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          sender.publicKey,
          receiver.publicKey,
          nft,
          signature,
          fromUserId,
          toUserId
        ],
        transaction
      });

      // 2. Actualizar la propiedad del NFT
      await sequelize.query(`
        UPDATE "UserCars" 
        SET "userId" = ? 
        WHERE "userId" = ? AND "carId" = ?
      `, {
        replacements: [toUserId, fromUserId, nft],
        transaction
      });
    });

    res.json({ 
      status: 'ok', 
      from: sender, 
      to: receiver, 
      nft, 
      signature,
      message: 'NFT transferido exitosamente'
    });
  } catch (error) {
    console.error('Error en transferencia de NFT:', error);
    res.status(500).json({ 
      error: 'Error al transferir el NFT', 
      details: error.message 
    });
  }
};

/**
 * @swagger
 * /api/exchange/order:
 *   post:
 *     summary: Crear una nueva orden (limit o market)
 *     tags: [Orderbook]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - side
 *               - type
 *               - amount
 *               - pair
 *             properties:
 *               side:
 *                 type: string
 *                 enum: [buy, sell]
 *               type:
 *                 type: string
 *                 enum: [limit, market]
 *               price:
 *                 type: string
 *                 description: Precio (solo para limit)
 *               amount:
 *                 type: string
 *               pair:
 *                 type: string
 *                 example: RACE/ETH
 *     responses:
 *       200:
 *         description: Orden creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 */
const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { side, type, price, amount, pair } = req.body;
  if (!side || !type || !amount || !pair) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }
  if (type === 'limit' && !price) {
    return res.status(400).json({ error: 'Falta el precio para orden limit' });
  }
  try {
    const order = await Order.create({
      user_id: userId,
      side,
      type,
      price: type === 'limit' ? price : null,
      amount,
      pair,
      status: 'open',
      filled_amount: 0
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la orden', details: error.message });
  }
};

/**
 * @swagger
 * /api/exchange/orderbook:
 *   get:
 *     summary: Obtener el orderbook para un par
 *     tags: [Orderbook]
 *     parameters:
 *       - in: query
 *         name: pair
 *         schema:
 *           type: string
 *         required: true
 *         description: Par de trading (ej: RACE/ETH)
 *     responses:
 *       200:
 *         description: Lista de órdenes abiertas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 buy:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 sell:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       400:
 *         description: Par no especificado
 */
const getOrderbook = async (req, res) => {
  const { pair } = req.query;
  if (!pair) return res.status(400).json({ error: 'Falta el par' });
  try {
    const buy = await Order.findAll({ where: { pair, side: 'buy', status: 'open' }, order: [['price', 'DESC']] });
    const sell = await Order.findAll({ where: { pair, side: 'sell', status: 'open' }, order: [['price', 'ASC']] });
    res.json({ buy, sell });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el orderbook', details: error.message });
  }
};

/**
 * @swagger
 * /api/exchange/order/cancel:
 *   post:
 *     summary: Cancelar una orden abierta
 *     tags: [Orderbook]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Orden cancelada
 *       404:
 *         description: Orden no encontrada
 *       403:
 *         description: No autorizado
 */
const cancelOrder = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.body;
  try {
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    if (order.user_id !== userId) return res.status(403).json({ error: 'No autorizado' });
    order.status = 'cancelled';
    await order.save();
    res.json({ status: 'cancelled', order });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar la orden', details: error.message });
  }
};

/**
 * @swagger
 * /api/exchange/recent-trades:
 *   get:
 *     summary: Obtener los últimos trades ejecutados para un par
 *     tags: [Orderbook]
 *     parameters:
 *       - in: query
 *         name: pair
 *         schema:
 *           type: string
 *         required: true
 *         description: Par de trading (ej: RACE/ETH)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Número máximo de trades a devolver (por defecto 10)
 *     responses:
 *       200:
 *         description: Lista de trades recientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   side:
 *                     type: string
 *                   price:
 *                     type: string
 *                   amount:
 *                     type: string
 *                   timestamp:
 *                     type: string
 */
const getRecentTrades = async (req, res) => {
  const { pair, limit = 10 } = req.query;
  if (!pair) return res.status(400).json({ error: 'Falta el par' });
  try {
    // Buscar en token_exchanges los últimos trades ejecutados para el par
    // Suponemos que el campo 'token' almacena el par (ajusta si es diferente)
    const [rows] = await sequelize.query(
      `SELECT id, from_username, to_username, token, amount, created_at
       FROM token_exchanges
       WHERE token = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      { replacements: [pair, limit] }
    );
    // Mapear a formato esperado
    const trades = rows.map(row => ({
      id: row.id,
      side: 'buy', // O puedes inferirlo si tienes info, aquí lo dejamos como 'buy' por defecto
      price: row.token, // Si tienes precio, ponlo aquí; si no, ajusta
      amount: row.amount,
      timestamp: row.created_at,
      from: row.from_username,
      to: row.to_username
    }));
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los trades recientes', details: error.message });
  }
};

module.exports = {
  exchangeToken,
  exchangeNFT,
  createOrder,
  getOrderbook,
  cancelOrder,
  getRecentTrades,
};