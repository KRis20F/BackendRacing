const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { getAccount, getAssociatedTokenAddress, createAssociatedTokenAccount } = require('@solana/spl-token');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const tokenService = require('../services/tokenService');
const { SolanaErrorHandler } = require('../utils/solanaErrors');

// Configuración
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.testnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
const RCF_USD_PRICE = 13; // 13 USD por RCF

// Cantidad de tokens RCF de bienvenida
const WELCOME_BONUS_AMOUNT = 10; // 10 RCF tokens de bienvenida

/**
 * @swagger
 * /api/wallet/create:
 *   post:
 *     summary: Create a new Solana wallet for user
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Wallet created successfully with welcome bonus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 welcomeBonus:
 *                   type: object
 *                   properties:
 *                     amount:
 *                       type: number
 *                     signature:
 *                       type: string
 *                     tokenAccount:
 *                       type: string
 *       400:
 *         description: User already has a wallet
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/wallet/token/account:
 *   post:
 *     summary: Create a token account for user
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicKey
 *             properties:
 *               publicKey:
 *                 type: string
 *                 description: User's Solana public key
 *     responses:
 *       200:
 *         description: Token account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokenAccount:
 *                   type: string
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/wallet/token/transfer:
 *   post:
 *     summary: Transfer tokens between wallets
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromPublicKey
 *               - toPublicKey
 *               - amount
 *             properties:
 *               fromPublicKey:
 *                 type: string
 *               toPublicKey:
 *                 type: string
 *               amount:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signature:
 *                   type: string
 *                 fromBalance:
 *                   type: string
 *                 toBalance:
 *                   type: string
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/wallet/token/balance/{publicKey}:
 *   get:
 *     summary: Get token balance for a wallet
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: publicKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Solana public key
 *     responses:
 *       200:
 *         description: Token balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicKey:
 *                   type: string
 *                 balance:
 *                   type: string
 *                 tokenSymbol:
 *                   type: string
 *       500:
 *         description: Server error
 */

const getTokenBalance = async (req, res, next) => {
  try {
    const result = await SolanaErrorHandler.withErrorHandling(async () => {
      const balance = await tokenService.getTokenBalance(req.params.publicKey);
      
      // Actualizar el balance en la base de datos
      const user = await User.findOne({ where: { publicKey: req.params.publicKey } });
      if (user) {
        await User.update(
          { 
            tokenBalance: balance,
            usdBalance: balance * RCF_USD_PRICE 
          },
          { where: { id: user.id } }
        );
      }

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

/**
 * @swagger
 * /api/wallet/sol/balance/{address}:
 *   get:
 *     summary: Get SOL balance for a wallet
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Solana wallet address
 *     responses:
 *       200:
 *         description: SOL balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                 sol:
 *                   type: number
 *       400:
 *         description: Invalid address
 *       500:
 *         description: Server error
 */

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

// PUT /api/wallet/:id - Actualizar datos de una wallet
const updateWallet = async (req, res) => {
  try {
    const walletId = req.params.id;
    const userId = req.user.id;
    const { address, balance } = req.body;

    // Buscar la wallet y verificar que pertenece al usuario
    const wallet = await Wallet.findOne({ where: { id: walletId, userId } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet no encontrada o no autorizada' });
    }

    // Actualizar los campos permitidos
    if (address) wallet.address = address;
    if (balance !== undefined) wallet.balance = balance;
    await wallet.save();

    res.json({ wallet });
  } catch (error) {
    console.error('Error actualizando wallet:', error);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
};

// GET /api/wallet - Listar todas las wallets del usuario autenticado
const listWallets = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallets = await Wallet.findAll({ where: { userId } });
    res.json(wallets);
  } catch (error) {
    console.error('Error listando wallets:', error);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
};

// POST /api/wallet - Crear una nueva wallet manualmente
const createWalletManual = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, balance } = req.body;
    if (!address) {
      return res.status(400).json({ error: 'Se requiere address' });
    }
    const wallet = await Wallet.create({ userId, address, balance: balance || 0 });
    res.status(201).json(wallet);
  } catch (error) {
    console.error('Error creando wallet:', error);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
};

// DELETE /api/wallet/:id - Eliminar una wallet por id
const deleteWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const walletId = req.params.id;
    const wallet = await Wallet.findOne({ where: { id: walletId, userId } });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet no encontrada o no autorizada' });
    }
    await wallet.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando wallet:', error);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
};

// GET /api/wallet/users - Listar todos los usuarios (para exchange)
const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'publicKey']
    });
    res.json(users);
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
};

module.exports = {
  createWallet,
  createTokenAccount,
  transferTokens,
  getTokenBalance,
  getSolBalance,
  updateWallet,
  listWallets,
  createWalletManual,
  deleteWallet,
  listUsers,
};