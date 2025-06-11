const crypto = require('crypto');

/**
 * Genera una firma única para una transacción
 * @returns {string} Firma hexadecimal de 64 caracteres
 */
const generateSignature = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateSignature
}; 