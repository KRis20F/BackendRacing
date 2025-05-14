const { PublicKey } = require('@solana/web3.js');
const { body, param, validationResult } = require('express-validator');

const validateTokenTransaction = [
  // Validar dirección de origen
  body('fromPublicKey')
    .isString()
    .custom(value => {
      try {
        new PublicKey(value);
        return true;
      } catch (error) {
        throw new Error('Invalid Solana public key');
      }
    }),

  // Validar dirección de destino
  body('toPublicKey')
    .isString()
    .custom(value => {
      try {
        new PublicKey(value);
        return true;
      } catch (error) {
        throw new Error('Invalid Solana public key');
      }
    }),

  // Validar cantidad
  body('amount')
    .isFloat({ min: 0.000000001 })
    .withMessage('Amount must be greater than 0'),

  // Middleware de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validatePublicKey = [
  param('publicKey')
    .isString()
    .custom(value => {
      try {
        new PublicKey(value);
        return true;
      } catch (error) {
        throw new Error('Invalid Solana public key');
      }
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateTokenTransaction,
  validatePublicKey
}; 