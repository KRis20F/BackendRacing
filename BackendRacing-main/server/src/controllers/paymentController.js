const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } = require('@solana/web3.js');
const sequelize = require('../config/database');
const User = require('../models/User');
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Pago en Solana
const sendPayment = async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  if (!fromUserId || !toUserId || !amount) return res.status(400).json({ error: 'Faltan parámetros' });

  const sender = await User.findByPk(fromUserId);
  const receiver = await User.findByPk(toUserId);
  if (!sender || !receiver) return res.status(404).json({ error: 'Usuario origen o destino no encontrado' });
  if (!sender.publicKey || !receiver.publicKey) return res.status(400).json({ error: 'Uno de los usuarios no tiene wallet' });

  try {
    const secret = Buffer.from(sender.walletSecret, 'hex');
    const senderKeypair = Keypair.fromSecretKey(secret);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: new PublicKey(receiver.publicKey),
        lamports: Math.floor(amount * LAMPORTS_PER_SOL)
      })
    );
    const signature = await connection.sendTransaction(tx, [senderKeypair]);
    await connection.confirmTransaction(signature, 'confirmed');
    await sequelize.query(`
      INSERT INTO transactions (
        from_addr, to_addr, amount, signature, 
        from_username, to_username
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        sender.publicKey,
        receiver.publicKey,
        amount,
        signature,
        sender.username,
        receiver.username
      ]
    });
    res.json({ signature, from: sender, to: receiver, amount });
  } catch (e) {
    res.status(500).json({ error: 'Error enviando pago', details: e.message });
  }
};

module.exports = {
  sendPayment
};