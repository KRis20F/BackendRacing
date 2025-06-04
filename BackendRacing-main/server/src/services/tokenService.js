const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { 
  getOrCreateAssociatedTokenAccount,
  transfer,
  getAccount,
  getMint
} = require('@solana/spl-token');
require('dotenv').config();

class TokenService {
  constructor() {
    // Verificar que las variables de entorno necesarias estén disponibles
    if (!process.env.SOLANA_RPC_URL) {
      throw new Error('SOLANA_RPC_URL not found in environment variables');
    }
    if (!process.env.MINT_ADDRESS) {
      throw new Error('MINT_ADDRESS not found in environment variables');
    }
    if (!process.env.WALLET_PRIVATE_KEY) {
      throw new Error('WALLET_PRIVATE_KEY not found in environment variables');
    }

    try {
      // Inicializar conexión con Solana testnet
      this.connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
      
      // Configurar la dirección del token RCF
      this.mintAddress = new PublicKey(process.env.MINT_ADDRESS);

      // Configurar la wallet principal (treasury)
      const privateKeyArray = JSON.parse(process.env.WALLET_PRIVATE_KEY);
      this.wallet = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
      
      console.log('TokenService initialized successfully');
      console.log('Treasury wallet public key:', this.wallet.publicKey.toString());
      console.log('RCF token address:', this.mintAddress.toString());
    } catch (error) {
      console.error('Error initializing TokenService:', error);
      throw error;
    }
  }

  async createUserTokenAccount(userPublicKey) {
    try {
      // Validar que la public key sea válida
      let publicKey;
      try {
        publicKey = new PublicKey(userPublicKey);
      } catch (error) {
        throw new Error('Invalid public key format');
      }

      // Crear la cuenta de token asociada
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.wallet,
        this.mintAddress,
        publicKey,
        true // allowOwnerOffCurve
      );

      return {
        tokenAccount: tokenAccount.address.toString(),
        balance: Number(tokenAccount.amount || 0) / Math.pow(10, 9)
      };
    } catch (error) {
      console.error('Error creating token account:', error);
      if (error.message.includes('TokenOwnerOffCurveError')) {
        throw new Error('Invalid wallet address format');
      }
      throw new Error('Failed to create token account: ' + error.message);
    }
  }

  async transferTokens(fromPublicKey, toPublicKey, amount) {
    try {
      // Obtener o crear cuenta de origen
      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.wallet,
        this.mintAddress,
        new PublicKey(fromPublicKey)
      );

      // Obtener o crear cuenta de destino
      const destinationAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.wallet,
        this.mintAddress,
        new PublicKey(toPublicKey)
      );

      // Realizar la transferencia usando el wallet como firmante
      const signature = await transfer(
        this.connection,
        this.wallet,
        sourceAccount.address,
        destinationAccount.address,
        this.wallet.publicKey,  // Usamos el wallet como autoridad
        amount * Math.pow(10, 9) // Convertir a la unidad más pequeña del token
      );

      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw new Error('Failed to transfer tokens: ' + error.message);
    }
  }

  async getTokenBalance(publicKey, retries = 3) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        // Validar que la public key sea válida
        let pubKey;
        try {
          pubKey = new PublicKey(publicKey);
        } catch (error) {
          throw new Error('Invalid public key format');
        }

        const tokenAccount = await getOrCreateAssociatedTokenAccount(
          this.connection,
          this.wallet,
          this.mintAddress,
          pubKey,
          true // allowOwnerOffCurve
        );
        
        const account = await getAccount(this.connection, tokenAccount.address);
        return Number(account.amount) / Math.pow(10, 9); // Convertir de la unidad más pequeña
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        lastError = error;
        if (error.message.includes('TokenOwnerOffCurveError')) {
          throw new Error('Invalid wallet address format');
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Backoff exponencial
      }
    }
    throw new Error(`Failed to get token balance after ${retries} attempts: ${lastError.message}`);
  }

  async getTokenSupply() {
    try {
      const mintInfo = await getMint(
        this.connection,
        this.mintAddress
      );
      return Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals);
    } catch (error) {
      console.error('Error getting token supply:', error);
      throw new Error('Failed to get token supply: ' + error.message);
    }
  }
}

// Exportar una única instancia del servicio
module.exports = new TokenService(); 