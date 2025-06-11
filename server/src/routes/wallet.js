const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { validateTokenTransaction, validatePublicKey } = require('../middleware/tokenValidation');
const { SolanaErrorHandler } = require('../utils/solanaErrors');
const auth = require('../middleware/auth');

// Rutas básicas de wallet
router.post('/create', auth, walletController.createWallet);
router.get('/token/balance/:publicKey', auth, validatePublicKey, walletController.getTokenBalance);
router.get('/sol/:address', auth, walletController.getSolBalance);

// Rutas de tokens
router.post('/token/account', auth, validatePublicKey, walletController.createTokenAccount);
router.post('/token/transfer', auth, validateTokenTransaction, walletController.transferTokens);

// Middleware de manejo de errores de Solana
router.use(SolanaErrorHandler.middleware);

router.put('/:id', auth, walletController.updateWallet);

router.get('/', auth, walletController.listWallets);
router.post('/', auth, walletController.createWalletManual);
router.delete('/:id', auth, walletController.deleteWallet);

router.get('/users', auth, walletController.listUsers);

module.exports = router;