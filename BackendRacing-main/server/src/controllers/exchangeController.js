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