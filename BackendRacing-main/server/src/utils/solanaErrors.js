class SolanaError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'SolanaError';
    this.code = code;
    this.originalError = originalError;
  }
}

const ERROR_CODES = {
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND'
};

class SolanaErrorHandler {
  static handle(error) {
    console.error('Solana error:', error);

    if (error.message.includes('insufficient funds')) {
      return new SolanaError(
        'Insufficient funds for transaction',
        ERROR_CODES.INSUFFICIENT_FUNDS,
        error
      );
    }

    if (error.message.includes('invalid address')) {
      return new SolanaError(
        'Invalid Solana address provided',
        ERROR_CODES.INVALID_ADDRESS,
        error
      );
    }

    if (error.message.includes('network error') || error.message.includes('connection error')) {
      return new SolanaError(
        'Failed to connect to Solana network',
        ERROR_CODES.NETWORK_ERROR,
        error
      );
    }

    if (error.message.includes('account not found')) {
      return new SolanaError(
        'Solana account not found',
        ERROR_CODES.ACCOUNT_NOT_FOUND,
        error
      );
    }

    return new SolanaError(
      'Transaction failed',
      ERROR_CODES.TRANSACTION_ERROR,
      error
    );
  }

  static middleware(err, req, res, next) {
    if (err instanceof SolanaError) {
      return res.status(400).json({
        error: {
          code: err.code,
          message: err.message
        }
      });
    }

    // Si no es un error de Solana, lo manejamos como error genérico
    console.error('Unexpected error:', err);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }

  static async withErrorHandling(fn) {
    try {
      return await fn();
    } catch (error) {
      throw SolanaErrorHandler.handle(error);
    }
  }
}

module.exports = {
  SolanaError,
  SolanaErrorHandler,
  ERROR_CODES
}; 