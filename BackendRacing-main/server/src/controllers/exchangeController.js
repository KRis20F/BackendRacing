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
      from_addr, to_addr, token, amount, signature,
      from_username, to_username
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, {
    replacements: [
      sender.publicKey,
      receiver.publicKey,
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

  const signature = crypto.randomBytes(32).toString('hex');
  await sequelize.query(`
    INSERT INTO nft_exchanges (
      from_addr, to_addr, nft, signature,
      from_username, to_username
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, {
    replacements: [
      sender.publicKey,
      receiver.publicKey,
      nft,
      signature,
      sender.username,
      receiver.username
    ]
  });
  res.json({ status: 'ok', from: sender, to: receiver, nft, signature });
};

module.exports = {
  exchangeToken,
  exchangeNFT
};