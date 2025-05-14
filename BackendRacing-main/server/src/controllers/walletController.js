const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { getAccount, getAssociatedTokenAddress, createAssociatedTokenAccount } = require('@solana/spl-token');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const tokenService = require('../services/tokenService');
const { SolanaErrorHandler } = require('../utils/solanaErrors');

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Cantidad de tokens RCF de bienvenida
const WELCOME_BONUS_AMOUNT = 10; // 10 RCF tokens de bienvenida

const createWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.publicKey) {
      return res.status(400).json({ error: 'El usuario ya tiene wallet' });
    }

    // 1. Crear wallet de Solana
    const wallet = Keypair.generate();
    const pubkey = wallet.publicKey.toBase58();
    
    // 2. Guardar en base de datos
    await Wallet.create({
      userId: user.id,
      address: pubkey,
      balance: 0
    });
    
    await User.update({ publicKey: pubkey }, { where: { id: userId } });

    // 3. Crear cuenta de token RCF para el usuario
    const tokenAccount = await tokenService.createUserTokenAccount(pubkey);
    console.log('Cuenta de token RCF creada:', tokenAccount);

    // 4. Enviar tokens de bienvenida desde la treasury
    const signature = await tokenService.transferTokens(
      tokenService.wallet.publicKey.toString(), // Treasury wallet
      pubkey,                                  // Wallet del usuario
      WELCOME_BONUS_AMOUNT                     // Cantidad de tokens de bienvenida
    );
    console.log('Tokens RCF de bienvenida enviados. Signature:', signature);

    // 5. Obtener usuario actualizado y enviar respuesta
    const updatedUser = await User.findByPk(userId);
    res.json({ 
      user: updatedUser,
      welcomeBonus: {
        amount: WELCOME_BONUS_AMOUNT,
        signature,
        tokenAccount: tokenAccount.tokenAccount
      }
    });
  } catch (error) {
    console.error('Error creando wallet:', error);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
};

const createTokenAccount = async (req, res, next) => {
  try {
    const result = await SolanaErrorHandler.withErrorHandling(async () => {
      const tokenAccount = await tokenService.createUserTokenAccount(req.body.publicKey);
      return { tokenAccount };
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const transferTokens = async (req, res, next) => {
  try {
    const result = await SolanaErrorHandler.withErrorHandling(async () => {
      const { fromPublicKey, toPublicKey, amount } = req.body;
      
      // Verificar que la cantidad sea válida
      if (!amount || amount <= 0) {
        throw new Error('La cantidad debe ser mayor que 0');
      }

      const signature = await tokenService.transferTokens(fromPublicKey, toPublicKey, amount);
      
      // Obtener balances actualizados
      const fromBalance = await tokenService.getTokenBalance(fromPublicKey);
      const toBalance = await tokenService.getTokenBalance(toPublicKey);

      return { 
        signature,
        fromBalance,
        toBalance
      };
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTokenBalance = async (req, res, next) => {
  try {
    const result = await SolanaErrorHandler.withErrorHandling(async () => {
      const balance = await tokenService.getTokenBalance(req.params.publicKey);
      return { 
        publicKey: req.params.publicKey,
        balance,
        tokenSymbol: 'RCF'
      };
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getSolBalance = async (req, res) => {
  const { address } = req.params;
  try {
    const publicKey = new PublicKey(address);
    const balanceLamports = await connection.getBalance(publicKey);
    const balanceSol = balanceLamports / 1e9;
    res.json({ address, sol: balanceSol });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createWallet,
  createTokenAccount,
  transferTokens,
  getTokenBalance,
  getSolBalance
};